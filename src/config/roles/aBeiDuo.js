import talentDamage from '../talentDamage'
import _ from 'lodash'

const log = console.log;

export function aBeiDuo(level, stars, skills=[1,1,1]){

  const name = 'aBeiDuo';

  const basic = {//lv90
    weaponType: '剑',
    life: 13226,
    attack: 251,
    defend: 876,
    critical: .05,
    criticalDamage: 1.5,
    energyCharge: 1,
    elementType: [0,0,0,0,0,1,0,1],//岩, 物理
    elementMaster: 0,
    elementCharge: [1,1,1,1,1,1.288,1,1],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
    otherCharge: [] //英文直接命名 AYAKA_ATTACK20
  };

  //todo
  //天赋1.怪物半血以下+e花25%伤害, 给定全程12.5% - ok
  //天赋2.q加队伍125精通10s - todo
  //2命e叠层每层给q增加30%防御伤害,最多4层 - todo
  //4命场上角色下落攻击伤害+30% - todo
  //6命结晶盾覆盖后增加场上角色17%伤害 - todo

  const talent = function(){
    //天赋1.怪物半血以下+e花25%伤害, 给定全程12.5%
    if(level >= 20){
      //若e生成伤害不需要增加, 则可加参数without: ['e_abd_only']
      this.increaseAddOnRefine = {
        name: 'abd_talent_1',
        effect: {
          effectAction: [0,0,0,1,0],
          effectWeaponType: [1,1,1,1,1],
          effectArea: 'elementCharge',
          effectElement: [1,1,1,1,1,1,1,1],
          attachedBy: [0,0,0,0,0,0,0,0],
          effectValue: .25,
        },
        timeCount: 10000
      };
    }
  };



  const chaNaZhiHua = {
    from: name,
    name: 'e_damage',
    sequenceDelay: 0,//后手覆盖
    delay: 20,       //最小间隔时间
    damageMultiple: talentDamage.aBeiDuo.e[skills[1]-1].hua,
    damageBase: [{base: 'defend', rate: 1, from: name}],
    damageType: 'E',
    attach: {
      element: [0,0,0,0,0,1,0,0],
      type: 'A',
      time: 95,
    }
  };

  const action = function(){

    const that = this;

    this.e = (startIdx) => {

      const start = startIdx; //取第一个
      const attr = {
        cd: 40,
        last: 6,      //todo
        sequence: 4,  //todo
        during: 300,
      };

      const effect = [{
        from: name,
        name: 'e_abd_only',
        sequence: attr.sequence,
        damageMultiple: talentDamage.aBeiDuo.e[skills[1]-1].base,
        damageBase: [{base: 'attack', rate: 1, from: name}],
        damageType: 'E',
        attach: {
          element: [0,0,0,0,0,1,0,0],
          type: 'A_abd',
          time: 95,
        }
      }];

      return [{
        name: 'aBeiDuo_skill_E',
        main: true, //主序的、唯一的、必须存在的  -- 绑定last和lasting
        last: attr.last,
        type: '单次',
        lasting: (lastIdx)=>{
          return lastIdx - start === attr.last - 1
        },
        sequence: (lastIdx) => {
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      },{
        name: 'aBeiDuo_skill_E_with_team_damage',
        main: false, //主序的、唯一的、必须存在的
        type: '持续',
        duringStart: ()=>{
          this.super.attackBindArr.push({
            bind: 'damage', // - 只要造成伤害
            from: name,
            name: 'aBeiDuo_skill_E_with_team_damage',
            sequenceArr: [chaNaZhiHua],
            delay: chaNaZhiHua.delay,
            sequenceDelay: chaNaZhiHua.sequenceDelay, //触发延迟, 越小越先结算
          });
        },
        during: (idxNew)=>{
          return {flag: idxNew - start === attr.during + attr.last - 1}; //last结束后触发
        },
        duringEnd: ()=>{
          if(_.find(this.super.attackBindArr, {name: 'aBeiDuo_skill_E_with_team_damage'})){
            this.super.attackBindArr.splice(_.findIndex(this.super.attackBindArr, {name: 'aBeiDuo_skill_E_with_team_damage'}), 1);
          }
          return true;
        }
      }];
    }

    this.q = (startIdx) => {

      //todo

    }
  };

  return {
    basic,
    talent,
    action
  }
}