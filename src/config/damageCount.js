import roll2Zh from './roll2Zh'
import _ from 'lodash'

const log = console.log;

const elementNameList = ['水','火','冰','雷','风','岩','草','物'];

export const damageCount = function(note){

  log(note)
  //[{}]
  /*
    {
      actionName: "q",
      from: "yeLan",
      lockedAttr: undefined,   //=>refineAttr
      multiplicationArea: {  //attr
        attack: 1115,
        critical: 0.877,
        criticalDamage: 3.276,
        damageType: 'Q',                      //伤害类型
        damageBase: [{base: 'life', rate: 1, from: 'yeLan'}],
        damageMultiple: 0.1023,
        defend: 624.172,
        elementCharge: (8) [1.676, 1.21, 1.21, 1.21, 1.21, 1.21, 1.21, 1.21],
        elementMaster: 42,
        elementReactionRate: undefined,
        elementReactionAloneArr: 0,
        elementReactionType: undefined,
        elementType: (8) [1, 0, 0, 0, 0, 0, 0, 0],
        level: 90,
        life: 34893.8,
        weaponType: '枪',

        monsterLevel: 90,
        monsterBaseDefend: 500,
        monsterMinusDefend: 0,
        monsterMinusDefendOnly: 0,
        monsterBaseResistance: (8) [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        monsterMinusResistance: (8) [0, 0, 0, 0, 0, 0, 0, 0],
        increaseAddOn: [],
        elementPool: [],
        elementReactionItemsArr: []
      },
      timing: 16,
      message: "第/time/秒，胡桃使用安神秘法(面板锁定)，造成/damage/点伤害。", --感觉不需要
      type: "attach/damage",
    }
  */

  const noteList = [];
  const attrLockList = ['life','attack','defend','critical','criticalDamage','energyCharge','elementMaster','elementReactionAloneArr','elementCharge','defendMitigation']

  note.forEach(sequence => {
    //技能消息/消息
    if(sequence.type === 'message'){
      noteList.push(sequence);
    }
    //伤害结算
    if(sequence.type === 'attach/damage' || sequence.type === 'reaction'){
      //lockedAttr + multiplicationArea => attr
      let attr = sequence.multiplicationArea;
      //载入锁面板属性
      if(sequence.lockedAttr){
        attrLockList.forEach(attribute => {
          attr[attribute] = sequence.lockedAttr[attribute];
        });
      }

      // if(sequence.from === 'aBeiDuo' && sequence.timing === 39){
      //   log(sequence.timing, JSON.parse(JSON.stringify(attr)))
      // }

      // log(sequence.timing)

      const damageBase = attackArea(attr);
      const {critical,criticalRate} = criticalArea(attr);
      const damageIncrease = increaseArea(attr);
      const defendMinus = defendArea(attr);
      const resistanceMinus = resistanceArea(attr);
      const {zengFuMuti, juBianDamage, type} = chargeArea(attr);

      // log(defendMinus,resistanceMinus, zengFuMuti)

      if(['燃烧','超导','扩散','感电','超载'].includes(type)){
        noteList.push({
          type: 'message',
          message: `第${sequence.timing/10}秒，${roll2Zh[sequence.from].name}触发${type}，造成${juBianDamage}点伤害。`,
          reactionType: type,
          damage: juBianDamage,
          critical: false,
          timing: sequence.timing/10,
        });
      }else{
        let reactionName = '',
            isCritical = critical ? '(暴击)' : '';
        if(['蒸发','融化'].includes(type)){
          reactionName = `(${type})`;
        }

        // if(sequence.from === 'xiao'){
        //   console.log(sequence.timing, damageBase, criticalRate,damageIncrease ,defendMinus ,resistanceMinus , zengFuMuti)
        // }

        let damageTypeName = '物理';
        const _elementType = elementNameList[attr.elementType.indexOf(1)];
        if(_elementType !== '物'){
          damageTypeName = _elementType + '元素';
        }

        const damage = Math.round(damageBase * criticalRate * damageIncrease * defendMinus * resistanceMinus * zengFuMuti);
        noteList.push({
          type: 'message',
          message: `第${sequence.timing/10}秒，${roll2Zh[sequence.from].name}使用${sequence.actionName}，造成${damage}${reactionName}${isCritical}点${damageTypeName}伤害。`,
          reactionType: type,
          damage,
          critical,
          timing: sequence.timing/10,
          elementType: attr.elementType,
        });
      }
    }

  });

  return noteList;
};

//基础乘区 攻击x倍率+额外
//攻击基数, 攻击比例 (胡桃2命雪梅香双重组合/申鹤冰凌加成)
const attackArea = (attr) => {
  let damageBase = 0;
  attr.damageBase.forEach(res => {
    //       attr.attack or attr.life
    let innerDamage = 0;
    if(res?.main){
      //attr.damageMultiple  倍率乘区
      innerDamage = attr[res.base] * res.rate * attr.damageMultiple
    }else{
      innerDamage = attr[res.base] * res.rate;
    }
    damageBase += innerDamage;
  });

  // if(attr.from === 'aBeiDuo'){
  //   console.log('==========', JSON.parse(JSON.stringify(attr)))
  // }

  const addOn = assignAddOns('attackArea', attr);

  return damageBase + addOn;
};

//双暴乘区
//特殊暴击计算 (如鱼叉对大招暴击, 小鹿6命e暴击) -- resolve assignAddOns
const criticalArea = (attr) => {
  const critical = attr.critical + assignAddOns('critical', attr);

  // log(critical)

  const criticalFlag = Math.random() <= critical;
  return {
    critical: criticalFlag,   //true 暴击
    criticalRate: criticalFlag ? attr.criticalDamage : 1,//伤害比
  };
};

//增伤乘区
//todo 特殊增伤 (苍古触发被动, 弓藏被动, 雪梅香算e, 等)
const increaseArea = (attr) => {
  const elementType = attr.elementType;
  const elementIndex = elementType.indexOf(1);
  //独立系数
  const addOn = assignAddOns('elementCharge', attr);
  // log(attr.elementCharge[elementIndex], addOn)
  return attr.elementCharge[elementIndex] + addOn; //增伤比
};

//怪物防御乘区 输出承伤比率 .5x
//防御承伤率: (100+角色等级)/( (100+角色等级)+(100+敌人等级)x(1-减防比例) )  --减防多个加算
const defendArea = (attr) => {
  const roleLevel = attr.level;
  const monsterLevel = attr.monsterLevel;
  const monsterDefend = attr.monsterBaseDefend;
  //todo monsterMinusDefendOnly ==> 雷神无视防御非线性最后叠加,这里的计算需要提前,暂记
  let defendMinus = attr.monsterMinusDefend + attr.monsterMinusDefendOnly;
  //减防超过100%
  if(defendMinus >= 1){
    defendMinus = 1;
  }
  return (100 + roleLevel) / ((100 + roleLevel) + (100 + monsterLevel) * (1 - defendMinus));
};

//怪物抗性乘区 输出承伤比率 .9x or 1.05x
const resistanceArea = (attr) => {
  const elementType = attr.elementType;
  const monsterResistance = attr.monsterBaseResistance;
  const resistanceMinus = attr.monsterMinusResistance;
  const elementIndex = elementType.indexOf(1);
  const minused = monsterResistance[elementIndex] - Math.abs(resistanceMinus[elementIndex]);
  return minused >= 0 ? (1 - minused) : (1 - minused / 2);
};

//反应乘区 增幅出系数1.5x or 2x 、剧变出伤害
const chargeArea = (attr) => {
  const roleLevel = attr.level;
  const elementMaster = attr.elementMaster;
  const elementReactionAloneArr = attr.elementReactionAloneArr; //魔女/莫娜命座的反应乘区, 与精通计算的数字相加
  const rate = attr.elementReactionRate;
  const type = attr.elementReactionType;
  let zengFuMuti = 1;

  //系数计算 https://bbs.nga.cn/read.php?tid=27127678&_fp=2
  //精通加成=类型系数/(1+1400/精通); 类型系数，增幅2.78，剧变16，结晶4.44
  //等级基本剧变参数 -- 4.0比例
  //   (燃烧：)  超导：扩散：感电：碎冰：超载
  //   =(0.5：)：1.0：1.2 ：2.4：3.0 ：4.0
  const levelBase = [34,37,40,43,45,49,53,58,63,68,74,81,89,97,107,118,129,139,150,161,172,183,194,206,217,226,236,
                     246,259,273,285,298,311,324,338,353,368,383,399,415,431,448,467,487,512,537,563,590,618,647,674,
                     701,729,757,797,833,869,906,945,986,1027,1078,1131,1185,1249,1303,1359,1416,1473,1531,1590,1649,
                     1702,1755,1828,1893,1959,2022,2090,2155,2220,2286,2353,2420,2508,2578,2651,2727,2810,2894];
  //按单倍算
  let juBianBaseDamage = levelBase[+roleLevel-1]/4;
  let chargeRate = 1;
  
  const juBianResistance = .1; //怪物剧变反应抗性, 在此拟定
  //剧变反应增幅百分比 + 1
  const juBianIncrease = 16 * elementMaster / (2000 + elementMaster) + 1;

  if(type === '燃烧'){//出伤害
    chargeRate = .5;
  }
  if(type === '感电'){//出伤害
    chargeRate = 2.4;
  }
  if(type === '超载'){//出伤害
    chargeRate = 4;
  }
  if(type === '超导'){//出伤害
    chargeRate = 1;
  }
  if(type === '扩散'){//出伤害
    chargeRate = 1.2;
  }
  const juBianDamage = juBianBaseDamage * chargeRate * juBianIncrease * (1-juBianResistance);
    
  if(type === '蒸发' || type === '融化'){//出系数
    const times = elementReactionAloneArr
      .filter(res => res.type === type)
      .reduce((sum, now) => sum += now.value, 0);
    // log('额外蒸发倍率',times)
    zengFuMuti = rate * ( 2.78/(1+1400/elementMaster) + times + 1);
  }
  return {zengFuMuti, juBianDamage, type};
};

const weaponNameList = ['剑','大剑','枪','弓','书'];
const actionNameList = ['A','Z','D','E','Q'];// ...还有其他

//细碎增益
const assignAddOns = (type, attr) => {
  if(!attr.increaseAddOn) {
    return 0;
  }
  const addOnArr = attr.increaseAddOn;
  const effectArr = addOnArr.filter(item => item.effect.effectArea === type);
  //attr.weaponType=弓 attr.elementType=[1,0,0,0,0,0,0,0] attr.damageType=Q

  const increase = effectArr.reduce((sum, now) => {
    // now.effect.effectWeaponType
    let flag = true;
    //武器不匹配
    if(now.effect.effectWeaponType[weaponNameList.indexOf(attr.weaponType)] === 0){
      flag = false;
    }
    //动作不匹配
    if(now.effect.effectAction[actionNameList.indexOf(attr.damageType)] === 0){
      flag = false;
    }
    //元素不匹配
    if(now.effect.effectElement[attr.elementType.indexOf(1)] === 0){
      flag = false;
    }

    //附着不匹配 - 匣里灭辰/冰套 等
    if(now.effect.attachedBy.includes(1)){
      //当前池子里所有存在的元素 [1,0,1,0,0,0,0,0]=>水冰共存
      let nowElementPool = (attr?.elementPool || []).reduce((_sum, _now) => {
        _sum[_now.sequence.attach.element.indexOf(1)] = 1;
        return _sum;
      }, new Array(9).fill(0));

      //冻结判断
      if(_.find(attr.elementReactionItemsArr, {name: 'element_reaction_freeze'})?.amount > 0){
        nowElementPool[8] = 1;
      }else{
        nowElementPool[8] = 0;
      }
      // log(_.cloneDeep(nowElementPool))

      //需要的附着元素 [0,0,1,0,0,0,0,0]
      const attachBy = now.effect.attachedBy;
      //需全满足的条件 => 冰4额外20/双冰共鸣 等 - todo 待测试
      if(now.effect.attachedType === 'and'){
        let andFlag = true;
        attachBy.forEach((res, idx) => {
          if(res === 1 && nowElementPool[idx] !== 1){
            andFlag = false;
          }
        });
        if(!andFlag){
          flag = false;
        }
      }
      //需部分满足的条件 => 冰4基础20 等
      if(!now.effect.attachedType || now.effect.attachedType === 'or'){
        let orFlag = false;
        attachBy.forEach((res, idx) => {
          if(res === 1 && nowElementPool[idx] === 1){
            orFlag = true;
          }
        });
        if(!orFlag){
          flag = false;
        }
      }
      // log(nowElementPool)
      // log(now.effect.attachedBy)
      // log(now.effect.attachedType) //and or
      //{sequence.attach.element:[]}
    }


    if(flag){
      if(type === 'attackArea'){
        // console.log('==========================',attr[now.effect.effectValue.base],now.effect.effectValue.rate)
        return attr[now.effect.effectValue.base] * now.effect.effectValue.rate
      }else{
        // console.log('==========================',now.effect.effectValue)
        return sum + now.effect.effectValue;
      }
    }else{
      return sum;
    }
  }, 0);

  // if(type === 'critical' && attr.from === 'shenLiLingHua'){
  //   log(increase)
  // }


  return increase;
};

