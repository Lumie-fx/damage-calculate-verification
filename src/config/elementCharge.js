import {damageCount} from "./damageCount";
import _ from 'lodash'

const log = console.log;

const elementPool = [];

let bindAttackTimeArr = []; //协同攻击, 同时多种
let bindAttackTimeDelayArr = []; //延迟伤害结算

export const chargeElementSequence = function(idx, sequenceArr){

  this.elementPoolMonster = elementPool;

  //到这里还是独立的一循环执行一次  ==> 其实只会独立执行

  //elementPool 每个元素留存-0.1s的量
  //todo 感电/冻结/燃烧
  //todo 挂冰/冻结判断冰套增加暴击等
  //持续留存的反应
  if(elementPool.length === 2){
    const elementType1 = elementPool[0].sequence.attach.element;
    const elementName1 = getElementZhName(elementType1);
    const elementType2 = elementPool[1].sequence.attach.element;
    const elementName2 = getElementZhName(elementType2);

    log(elementPool[0].endTime, elementPool[0].amount, elementPool[1].endTime, elementPool[1].amount, idx)

    if(elementName1 === '水' && elementName2 === '雷' || elementName1 === '雷' && elementName2 === '水'){
      if(elementPool[0].endTime === idx){
        reaction2Element.bind(this)(elementPool, idx);

        // const {type,rate,isReaction,amount0} = reaction2Element(elementPool, idx);
        // log('||||||||||||||'+type)
        // if(['感电'].includes(type||'')){
        //   // this.note.push({
        //   //   from: item.sequence.from,
        //   //   timing: idx,
        //   //   type: 'reaction',
        //   //   actionName: item.sequence.name,
        //   //   // amount0,
        //   //   lockedAttr,
        //   //   message,
        //   //   multiplicationArea: packDamageItem.bind(this)(item, {}),
        //   // });
        // }
      }
    }
  }

  //元素附着结束
  const deleteElementIndex = [];
  elementPool.map((res, idx) => {
    res.amount -= res.decrease;
    if(res.amount <= 0){
      deleteElementIndex.push(idx);
    }
  });
  if(deleteElementIndex.length > 0){
    deleteElementIndex.reverse().forEach(index => {
      elementPool.splice(index, 1);
    });
  }

  if(sequenceArr === null){
    elementReaction.bind(this)(idx, null);
  }else{
    sequenceArr.forEach(sequence => {
      let elementAttach = {amount:0,decrease:0};
      switch (sequence.attach.time){
        case 95:  elementAttach = {amount:1, decrease: 8/950};   break;
        case 120: elementAttach = {amount:2, decrease: 16/1200}; break;
        case 170: elementAttach = {amount:4, decrease: 32/1700}; break;
      }
      //最后处理decrease -- 保留4位小数
      elementAttach.decrease = Math.round(elementAttach.decrease.toFixed(4) * 10000) / 10000;

      // log('动作',sequence.damageType, idx, this.attackBindFlag, this.attackBindTime)

      //附魔处理
      const attackAttachArr = _.cloneDeep(this.attackAttachArr);
      /*
        {
          name: 'shenLi_spurt_5s_ice_attackAttach',
          role: 'shenLiLingHua',
          type: 'person',//person / all
          element: [0,0,1,0,0,0,0,0],
          time: 50,
        }
      */
      if(['A','Z','D'].includes(sequence.damageType) &&
        ['剑','大剑','枪'].includes(this[sequence.from].weaponType) &&
        attackAttachArr.length > 0){

        //todo 元素的相互覆盖处理 - 班尼特/重云 等
        //暂时先处理绫华的e附魔
        attackAttachArr.forEach(res => {
          if(res.type === 'person' && res.role === sequence.from){
            sequence.attach.element = res.element;
          }
        });
      }


      this.team.forEach(role => {
        role.eventTrigger.forEach(timingEvent => {
          //
          if(timingEvent.type === '2'){
            //使用的与伤害类型一致 $003              同一个人 这里的from包括队里所有人===这个是当前要触发的人
            if(sequence.damageType === timingEvent.bindAction && sequence.from === timingEvent.from && !timingEvent.isCd){
              // log(idx, '特殊被动触发',timingEvent.bindAction,sequence.from)
              timingEvent.reward(idx);
              timingEvent.open = true;
              timingEvent.isCd = true;
            }
          }
        })
      });


      elementReaction.bind(this)(idx, {...elementAttach, sequence});

// log(idx,sequence.damageType,sequence.damageMultiple,sequence.from)

      //普攻附带协同攻击
      // if(sequence.damageType === 'A'){
        // this.attackBindArr.sort((a,b) => {
        //   return a.sequence - b.sequence;
        // });
        this.attackBindArr.forEach(sequenceObj => {
          // log(sequenceObj)

          const func = () => {

            const bindAttackKey = sequenceObj.from+'_'+sequenceObj.name;
            // log(idx, bindAttackKey)

            if(!_.find(bindAttackTimeArr, {name: bindAttackKey})){
              bindAttackTimeArr.push({
                name: bindAttackKey,
                time: -100,
                sequence: sequenceObj.sequence, //触发延迟 -- 越小越先触发
                sequenceTime: 0, //从触发到伤害结算
              });
            }
            const bindAttackObj = _.find(bindAttackTimeArr, {name: bindAttackKey});
// log(idx, JSON.parse(JSON.stringify(bindAttackObj)))
            if(idx - bindAttackObj.time >= sequenceObj.delay){
              bindAttackObj.time = idx;
              //如果需要延迟触发
              if(sequenceObj?.sequenceDelay > 0){
                bindAttackTimeDelayArr.push({
                  idx,
                  sequenceObj,
                  elementAttach,
                });
              }else{
                chargeElementSequence.bind(this)(idx, sequenceObj.sequenceArr);
              }
            }
          };
          //普攻附带协同攻击
          if(sequenceObj.bind === 'A' && sequence.damageType === 'A'){
            func();
          }
          //全伤害触发
          if(sequenceObj.bind === 'damage' && sequence.damageMultiple > 0){
            if(sequenceObj.from === 'aBeiDuo' && sequence.name === 'e_abd_only'){
              //阿贝多自己的e不触发 todo 有个bug - 刹那之花不能被协同攻击触发(夜兰玲珑骰)
            }else{
// log(idx, JSON.parse(JSON.stringify(sequence)))
              func();
            }
          }
        });
      // }


      if(sequence.damageType === 'E'){
        // log(sequence)

      }

      if(sequence.damageType === 'Q'){
        if(sequence.from === 'huTao'){
          // log(idx)
          // log(sequence.lockedAttr)
          // log(JSON.parse(JSON.stringify(this.huTao.refineAttr)))
        }
      }

    });
  }


  // log(idx, bindAttackTimeDelayArr)

  //删除列表
  let bindAttackTimeDelayClear = [];
  //延迟触发的事件集合
  bindAttackTimeDelayArr.forEach((item, index) => {
    //延迟到时间
    if(idx - item.idx === item.sequenceObj.sequenceDelay){
      //删除列表
      bindAttackTimeDelayClear.push(index);
      //伤害触发
      item.sequenceObj.sequenceArr.forEach(sequence => {
        elementReaction.bind(this)(idx, {...item.elementAttach, sequence});
      });
    }
  });
  //删除
  bindAttackTimeDelayClear.reverse().forEach(_index => {
    bindAttackTimeDelayArr.splice(_index, 1);
  });


}


//计时器判断池
const flagMap = {};
const flagRes = {};

const elementReaction = function(idx, item){

  //2.5s计时器 + 3次计数器, 不同技能模组可能用不同计时/计数器, 如绫华霰步+普攻+霜灭
  //故制定规则, A类区分同一计数器下的模组, B类统一视为无附着CD => elementAttachType (需要与角色名字绑定区分)
  //C为不附着, 如下落过程中的伤害, 登龙剑下落伤害C, 砸地伤害B

  let isAttach = false;

  if(item){
    const type = item.sequence.attach.type; //type需要与角色名绑定, 在role中定义好

    if(!flagRes[type]){
      flagRes[type] = [];
    }

    //A类双计数器
    if(type.indexOf('A') > -1){
      //首次
      if(flagMap[type] === undefined){
// log(idx,type,'不存在')
        flagMap[type+'Time'] = idx;
        flagMap[type] = false;
        // isAttach = true;
        attach.bind(this)(item, idx);
        return;
      }
      //计数3找下一个
      if(flagMap[type] === true){
        // isAttach = true;
        if(idx - flagMap[type+'Time'] >= 25){
          //先判断是否经过2.5秒, 优先用2.5秒的计时器
          flagMap[type+'Time'] = idx; //不重要, 用不到这个赋值了
          flagRes[type] = [];
          attach.bind(this)(item, idx);
// log(idx,type,'3次且超过2.5s')
        }else{
          attach.bind(this)(item, idx);
// log(idx,type,'3次')
        }
        flagMap[type] = false;
        return;
      }
      flagRes[type].push({time: idx});
    }

    //B类无附着cd
    if(type === 'B'){
      isAttach = true;
      attach.bind(this)(item, idx);
    }

    //C类不附着
    if(type === 'C'){
      // attach(item);
    }
  }

// log(idx, JSON.parse(JSON.stringify(flagRes)))

  for(let _key in flagRes){  //_key: A1, A2, ..., B, ...
    const typeArr = flagRes[_key]; //A1: [{}],  B: [] ...

    //todo 不同技能使用不同计时器的可行性 如: 夜兰q的协同是2s

    //                         idx       A1Time: idx_old
    if(typeArr.filter(res=>res.time - flagMap[_key+'Time'] >= 25).length > 0){

// log(idx,_key,'2.5s', flagMap[_key+'Time'])

      //2.5s计数器清除
      flagMap[_key+'Time'] = idx; //不重要, 用不到这个赋值了
      flagRes[_key] = [];
      isAttach = true;
      attach.bind(this)(item, idx);
      break;
    }else if(typeArr.length === 2){
      //计数3
      flagMap[_key] = true;
      flagRes[_key] = [];
      break;
    }
  }

  if(!isAttach && item){
    notAttach.bind(this)(item, idx);
  }

}

/*

弱元素：9.5s-1 强元素：12s-2 超强元素：17s-4

9.5-0.8  12-1.6  17-3.2
1. y=-0.8/9.5x + 0.8
2. y=-1.6/12x + 1.6
3. y=-3.2/17x + 3.2
x-时间    y-元素量

*/

const element2Name = ['水','火','冰','雷','风','岩','草','物'];
const getElementZhName = (elementArr) => {
  return element2Name[elementArr.indexOf(1)];
};

/*
  elementPool: [{}]
    amount: 0.8
    decrease: 0.0084
    sequence:
      attach:
        element: (8) [0, 1, 0, 0, 0, 0, 0, 0]
        time: 95
        type: "A1" /B/C
      damageMultiple: 0.836
      from: "huTao"
      name: "a1"
      sequence: 2
*/
//todo 水雷共存=>先水 冰水共存=>先冰

function attach(item, idx){
  // log('attach', idx, item.sequence.name);

  const itemType = item.sequence.attach.element;
  const elementName = getElementZhName(itemType);

  if(['物'].includes(elementName)){
    return notAttach.bind(this)(item, idx);
  }

  if(elementPool.length === 0){
    if(['风','岩'].includes(elementName)){
      return notAttach.bind(this)(item, idx);
    }
    item.amount = item.amount * .8;
  }
  elementPool.push(item);

  // log('attach', elementName, item.sequence.name)

  // const _element = elementPool.map(res=>res.amount).join(',');
  // log(idx, _.cloneDeep(elementPool))

  //锁面板属性存在
  const lockedAttr = item.sequence?.lockedAttr || null;
  const message = item.sequence?.message

  if(elementPool.length === 1){

    // if(item.sequence.from === 'aBeiDuo'){
    //   log(idx,'abd doing1')
    // }

    this.note.push({
      from: item.sequence.from,
      timing: idx,
      type: 'attach/damage',
      actionName: item.sequence.name,
      lockedAttr,
      message,
      multiplicationArea: packDamageItem.bind(this)(item, null),
    })
  }

  if(elementPool.length === 2){
    //融化/蒸发/.. 1.5/2  true/false(2种同属性元素)
    const {type,rate,isReaction,amount0} = reaction2Element.bind(this)(elementPool, idx);

    if(isReaction){
      //                                                   仅元素附着不进行伤害计算
      if(['感电','扩散','超导'].includes(type||'') && item.sequence.damageType!=='T'){
        this.note.push({
          from: item.sequence.from,
          timing: idx,
          type: 'reaction',
          actionName: item.sequence.name,
          // amount0,
          lockedAttr,
          message,
          multiplicationArea: packDamageItem.bind(this)(item, {}),
        });
      }
      this.note.push({
        from: item.sequence.from,
        timing: idx,
        type: 'reaction',
        actionName: item.sequence.name,
        // amount0,
        lockedAttr,
        message,
        multiplicationArea: packDamageItem.bind(this)(item, {type, rate}),
      });
    }else{
      this.note.push({
        from: item.sequence.from,
        timing: idx,
        type: 'attach/damage',
        actionName: item.sequence.name,
        // amount0,
        lockedAttr,
        message,
        multiplicationArea: packDamageItem.bind(this)(item, {type, rate}),
      });
    }
  }

  //todo
  if(elementPool.length === 3){
    //水雷+水/雷 补充  --弱风双扩
    //水冰+水/冰 补充  --风扩散时, 冰水成冻,优先扩藏元素,过量水风优先扩水,过量风继续扩冰
    //...
    log(3, idx, _.cloneDeep(elementPool))
    //{amount: 1.0536999999999992, decrease: 0.0133, sequence: {…}, endTime: 58}
      /*
      sequence:
        attach: {
          element: (8) [1, 0, 0, 0, 0, 0, 0, 0]
          time: 120
          type: "A_q_yelan"
        }
        damageBase: [{base: 'life', rate: 1, from: 'yeLan', main: true}]
        damageMultiple: 0.1398
        damageType: "Q"
        from: "yeLan"
        name: "q"
        sequence: 15
      */
    reaction3Element(elementPool, idx)

  }

}

function notAttach(item, idx){
  // log('not attach', idx, item.sequence.name);

  // if(item.sequence.from === 'aBeiDuo'){
  //   log(idx,'abd doing3')
  // }


  this.note.push({
    from: item.sequence.from,
    timing: idx,
    type: 'attach/damage',
    actionName: item.sequence.name,
    lockedAttr: item.sequence?.lockedAttr || null,
    message: item.sequence?.message,
    multiplicationArea: packDamageItem.bind(this)(item, null),
  })
}

function damageCountCalc(noteObj){
  damageCount(noteObj);
}

function packDamageItem(item, reaction){

  const {type, rate} = reaction || {};
  const name = item.sequence.from;
  // log('==================')
  // log(_.cloneDeep(this.attackAttachArr))

  return {
    from: name,
    level: this[name].level,                                   //等级
    weaponType: this[name].weaponType,                         //武器类型
    attack: this[name].refineAttr.attack,                      //攻击
    life: this[name].refineAttr.life,                          //生命
    defend: this[name].refineAttr.defend,                      //防御
    damageType: item.sequence.damageType,                      //伤害类型
    damageBase: _.cloneDeep(item.sequence.damageBase),         //伤害基于? 攻击/生命/多个..  [额外倍率]
    damageMultiple: item.sequence.damageMultiple,              //倍率
    critical: this[name].refineAttr.critical,                  //暴击
    criticalDamage: this[name].refineAttr.criticalDamage,      //爆伤
    elementType: _.cloneDeep(item.sequence.attach.element),    //元素类型
    elementCharge: _.cloneDeep(this[name].refineAttr.elementCharge), //元素增伤
    elementMaster: this[name].refineAttr.elementMaster,        //元素精通
    elementReactionType: type,                                 //反应类型
    elementReactionRate: rate,                                 //反应倍率
    elementReactionAloneArr: this[name].refineAttr.elementReactionAloneArr,//反应倍率2
    monsterLevel: this.monsterLevel,                           //伤害对象等级
    monsterBaseDefend: this.defendMitigationBase,              //伤害对象基础防御
    monsterMinusDefend: this.defendMitigation,                 //伤害对象防御减免
    monsterMinusDefendOnly: this[name].refineAttr.defendMitigation,   //伤害对象防御减免--角色独立(雷神2命)
    monsterBaseResistance: _.cloneDeep(this.resistanceMitigationBase),//伤害对象基础抗性
    monsterMinusResistance: _.cloneDeep(this.resistanceMitigation),   //伤害对象抗性减益
    increaseAddOn: _.cloneDeep(this[name].refineAttr.increaseAddOn),  //额外伤害组件
    elementPool: _.cloneDeep(elementPool),                     //当前附着元素
    elementReactionItemsArr: _.cloneDeep(this.elementReactionItemsArr),//元素反应生成物
  }
}


//反应
const reactionType1 = (pool, muti) => {
  pool[0].amount -= pool[1].amount * muti;
  if(pool[0].amount <= 0){
    pool.splice(0, 2);
  }else{
    pool.splice(1, 1);
  }
};
//感电
const reactionType2Electro = (pool, idx) => {
  pool[0].amount -= .4;
  pool[1].amount -= .4;
  if(pool[0].amount <= 0 && pool[1].amount <= 0){
    pool.splice(0, 2);
  }else if(pool[0].amount <= 0){
    pool.splice(0, 2); //后手无残留
  }else if(pool[1].amount <= 0){
    pool.splice(1, 1);
  }else{
    pool[0].endTime = idx + 5; //下0.5秒继续存续反应
    pool[1].endTime = idx + 5;
  }
};
//冻结
function reactionType2Freeze(pool, idx){
  const dropElement = pool[0].amount < pool[1].amount ? 0 : 1;
  const stillElement = +!dropElement;
  const amount = pool[dropElement].amount;
  pool[stillElement].amount -= amount;
  pool.splice(dropElement, 1);
  this.elementReactionItemsRefine = {
    name:'element_reaction_freeze',
    amount: amount * 2,
  };
}

/*
  element
    amount: 0.8
    decrease: 0.0084
    sequence:
      attach:
        element: (8) [0, 1, 0, 0, 0, 0, 0, 0]
        time: 95
        type: "A1" /B/C
      damageMultiple: 0.836
      from: "huTao"
      name: "a1"
      sequence: 2
*/
function reaction2Element(pool, idx){
  const elementType1 = pool[0].sequence.attach.element;
  const elementName1 = getElementZhName(elementType1);
  const elementType2 = pool[1].sequence.attach.element;
  const elementName2 = getElementZhName(elementType2);

  let type = null;
  let rate = null;
  let isReaction = true;

  //['水','火','冰','雷','风','岩','草','物'];
  if(elementName1 === elementName2){
    const elementTime1 = pool[0].sequence.attach.time;
    const elementTime2 = pool[1].sequence.attach.time;
    if(elementTime1 === 95 && elementTime2 === 95){
      pool[0].amount = .8;
    }
    if(elementTime1 === 95 && elementTime2 === 120){
      pool[0].amount = 1.6;
    }
    if(elementTime1 === 120 && elementTime2 === 95){
      pool[0].amount = 1.6;
    }
    if(elementTime1 === 120 && elementTime2 === 120){
      pool[0].amount = 1.6;
    }
    pool.splice(1, 1);
    isReaction = false;
  }


  if(elementName2 === '风'){
    type = '扩散-' + elementName1;
    //todo 风套减抗区
    reactionType1(pool, .5);
  }

  if(elementName2 === '岩'){
    type = '结晶-' + elementName1;
    //todo 磐岩增伤区
    reactionType1(pool, .5);
  }

  if(elementName1 === '水' && elementName2 === '火'){
    type = '蒸发';
    rate = 1.5;
    reactionType1(pool, .5);
  }

  if(elementName1 === '水' && elementName2 === '冰' || elementName1 === '冰' && elementName2 === '水'){
    type = '冻结';
    // this.note.push({
    //   type: 'message',
    //   message: `第${idx/10}秒，触发冻结反应，怪物被冻结。`,
    // })
    reactionType2Freeze.bind(this)(pool, idx);
    //todo
  }

  if(elementName1 === '水' && elementName2 === '雷' || elementName1 === '雷' && elementName2 === '水'){
    //todo 测试
    // 存在感电endTime倒计时不反应                时间没到新的感电时间时不反应
    if((pool[0].endTime && pool[1].endTime) && pool[0].endTime !== idx){
      isReaction = false;
    }else{
      type = '感电';
      reactionType2Electro(pool, idx);
    }
  }

  if(elementName1 === '水' && elementName2 === '草'){
    //todo
    isReaction = false;
  }

  if(elementName1 === '火' && elementName2 === '水'){
    type = '蒸发';
    rate = 2;
    reactionType1(pool, 2);
  }

  if(elementName1 === '火' && elementName2 === '冰'){
    type = '融化';
    rate = 1.5;
    reactionType1(pool, .5);
  }

  if(elementName1 === '火' && elementName2 === '雷' || elementName1 === '雷' && elementName2 === '火'){
    type = '超载';
    reactionType1(pool, 1);
  }

  if(elementName1 === '火' && elementName2 === '草'){
    //todo
    isReaction = false;
  }

  if(elementName1 === '冰' && elementName2 === '火'){
    type = '融化';
    rate = 2;
    reactionType1(pool, 2);
  }

  if(elementName1 === '冰' && elementName2 === '雷' || elementName1 === '雷' && elementName2 === '冰'){
    //todo 怪物减防
    type = '超导';
    reactionType1(pool, 1);
  }

  if(elementName1 === '冰' && elementName2 === '草'){
    //todo
    isReaction = false;
  }

  if(elementName1 === '雷' && elementName2 === '草'){
    //todo
    isReaction = false;
  }

  //todo 草为第一个1元素的情况

  return {type,rate,isReaction,amount0:pool?.[0]?.amount};
}


function reaction3Element(pool, idx){
  const elementType1 = pool[0].sequence.attach.element;
  const elementName1 = getElementZhName(elementType1);
  const elementType2 = pool[1].sequence.attach.element;
  const elementName2 = getElementZhName(elementType2);
  const elementType3 = pool[2].sequence.attach.element;
  const elementName3 = getElementZhName(elementType3);

  if(['水雷','雷水'].includes(elementName1+elementName2)){
    //如果是存续反应的补充 - 感电
    if(['水','雷'].includes(elementName3)){
      const sameType = elementName1 === elementName3 ? 0 : 1;
      const elementTimeFirst = pool[sameType].sequence.attach.time;
      const elementTimeSecond = pool[2].sequence.attach.time;
      if(elementTimeFirst === 95 && elementTimeSecond === 95){
        pool[sameType].amount = .8;
      }
      if(elementTimeFirst === 95 && elementTimeSecond === 120){
        pool[sameType].amount = 1.6;
      }
      if(elementTimeFirst === 120 && elementTimeSecond === 95){
        pool[sameType].amount = 1.6;
      }
      if(elementTimeFirst === 120 && elementTimeSecond === 120){
        pool[sameType].amount = 1.6;
      }
      pool.splice(2, 1);
    }

    //elementName3 === 火 / 风 / 岩 等

  }



  //todo 激化 蔓生
}











