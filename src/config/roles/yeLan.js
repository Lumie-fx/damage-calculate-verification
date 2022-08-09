import talentDamage from '../talentDamage'
import _ from 'lodash'

const log = console.log;

export function yeLan(level, stars, skills=[1,1,1]){

  const name = 'yeLan';

  const basic = {//lv90
    weaponType: '弓',
    life: 14450,
    attack: 244,
    defend: 548,
    critical: .242,
    criticalDamage: 1.5,
    energyCharge: 1,
    elementType: [1,0,0,0,0,0,0,1],//水, 物理
    elementMaster: 0,
    elementCharge: [1,1,1,1,1,1,1,1],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
    otherCharge: [] //英文直接命名 AYAKA_ATTACK20
  };

  //todo
  //0命轴qae
  //1命可选轴增加qeae
  //2命协同额外触发    --ok
  //4命全队加血        --ok
  //6命可选轴增加qaeaea
  //天赋1提升自身生命   --ok
  //天赋2q期间前台角色增伤 --ok

  const talent = function(){
    if(level >= 20){
      const lifeTalent1 = [.06,.12,.18,.3][ + this.teamElementNum - 1];
      this.lifeRefine = {name: 'yeLan_talent1_life', value: lifeTalent1, type: 'percent'};
    }
  };

  const action = function(){

    const that = this;

    this.a = (startIdx) => {

      const start = startIdx;//取第一个
      const attr = {
        cd: 0,
        last: 5,       //todo
        sequenceA: 4,   //todo
      };

      const effect = [{
        from: name,
        name: 'a1',
        sequence: attr.sequenceA,
        damageMultiple: talentDamage.yeLan.a1[skills[0]-1].base,
        damageType: 'A',
        damageBase: [{base: 'attack', rate: 1, from: name}],
        attach: {
          element: [0,0,0,0,0,0,0,1],
          type: 'A1'+name,
          time: 95,
        }
      }];

      return [{
        name: 'yeLan_attack_A',
        main: true,  //主序的、唯一的、必须存在的
        last: attr.last,
        lasting: (lastIdx) => {
          return lastIdx - start === attr.last - 1
        },
        type: '单次',
        sequence: (lastIdx) => {
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }]
    };

    this.e = (startIdx) => {

      //命座4额外效果 --25s持续,可视为永久, 一发拟定20%
      //先吃到生命加成再计算伤害 --还是有点问题,提前吃到了
      if(stars >= 4){
        this.super.teamRefine('all', 'yeLan', {
          name: 'life',
          value: {name: 'yeLan_skillE_star4_'+startIdx, value: .2, type: 'percent'}
        });
      }

      const start = startIdx; //取第一个
      const attr = {
        cd: 100,
        last: 8,
      };

      const effect = [{
        from: name,
        name: 'e',
        sequence: 7,     // 0~7 对应的last=8为末尾   todo 具体帧
        damageMultiple: talentDamage.yeLan.e[skills[1]-1].base,
        damageBase: [{base: 'life', rate: 1, from: name}],
        damageType: 'E',
        attach: {
          element: [1,0,0,0,0,0,0,0],
          type: 'B',
          time: 95,
        }
      }];

      return [{
        name: 'yeLan_skill_E',
        main: true, //主序的、唯一的、必须存在的
        last: attr.last,
        lasting: (lastIdx)=>{
          return lastIdx - start === attr.last - 1
        },
        type: '单次',
        sequence: (lastIdx) => {
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }]
    }

    this.q = (startIdx) => {

      const start = startIdx; //取第一个
      const attr = {
        cd: 180,
        last: 17,        //todo
        during: 150,
      };

      const effect = [{
        from: name,
        name: 'q',
        sequence: 15,     //todo 具体帧
        damageMultiple: talentDamage.yeLan.q[skills[2]-1].base,
        damageBase: [{base: 'life', rate: 1, from: name}],
        damageType: 'Q',
        attach: {
          element: [1,0,0,0,0,0,0,0],
          type: 'A_q_yelan',
          time: 120,
        }
      }];

      const linLongTou = {
        from: name,
        name: 'q_a',
        sequenceDelay: 2,    //此处代表触发延迟
        delay: 9,       //最小间隔时间
        damageMultiple: talentDamage.yeLan.q[skills[2]-1].linLongTou,
        damageBase: [{base: 'life', rate: 1, from: name}],
        damageType: 'Q',
        attach: {
          element: [1,0,0,0,0,0,0,0],
          type: 'A',
          time: 95,
        }
      };

      const stars2 = {
        from: name,
        name: 'q_star2',
        sequenceDelay: 3,     //此处代表触发延迟
        delay: 18,       //最小间隔时间
        damageMultiple: .14,
        damageBase: [{base: 'life', rate: 1, from: name}],
        damageType: 'Q',
        attach: {
          element: [1,0,0,0,0,0,0,0],
          type: 'B',
          time: 95,
        }
      };

      const returnList = [{
        name: 'yeLan_skill_Q',
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
        name: 'yeLan_skill_Q_with_team_attack',
        main: false, //主序的、唯一的、必须存在的
        type: '持续',
        duringStart: ()=>{
          this.super.attackBindArr.push({
            bind: 'A',
            from: name,
            name: 'yeLan_skill_Q_with_team_attack',
            sequenceArr: new Array(3).fill(linLongTou),
            delay: linLongTou.delay,
            sequenceDelay: linLongTou.sequenceDelay, //触发延迟, 越小越先结算
          });
        },
        during: (idxNew)=>{
          return {flag: idxNew - start === attr.during + attr.last - 1}; //last结束后触发
        },
        duringEnd: ()=>{
          if(_.find(this.super.attackBindArr, {name: 'yeLan_skill_Q_with_team_attack'})){
            this.super.attackBindArr.splice(_.findIndex(this.super.attackBindArr, {name: 'yeLan_skill_Q_with_team_attack'}), 1);
          }
          return true;
        }
      },{
        name: 'yeLan_talent2_team_front_increase_damage_50',
        main: false, //主序的、唯一的、必须存在的
        type: '持续',
        duringStart: (i)=>{
          this.elementChargeRefine = {
            name: 'yeLan_talent2_team_front_increase_damage_50',
            value: new Array(8).fill(.01),
            type: 'number',
            front: true,
          };
        },
        during: (idxNew)=>{
          //寻找前台角色每10个idx进行一次增长
          const effectTime = idxNew - start - attr.last; // 0~149
          if(effectTime >= 0 && effectTime % 10 === 0){
            //idxNew - start - attr.last   0~149
            const increase = Math.floor(effectTime / 10) * .035 + .01;
            // log('increase:'+increase)
            this.super.teamRefine('front', name, {
              name: 'elementCharge',
              value: {
                name: 'yeLan_talent2_team_front_increase_damage_50',
                value: new Array(8).fill(increase),
                type: 'number',
                front: true
              }
            });
          }
          return {flag: idxNew - start === attr.during + attr.last - 1}; //last结束后触发duringEnd
        },
        duringEnd: ()=>{
          this.super.teamRefine('front', name, {
            name: 'elementCharge',
            value: {
              name: 'yeLan_talent2_team_front_increase_damage_50',
              value: new Array(8).fill(0),
              type: 'number',
              front: true
            }
          });
          return true;
        }
      }];

      if(stars >= 2){
        returnList.push({
          name: 'yeLan_star2_with_team_attack',
          main: false, //主序的、唯一的、必须存在的
          type: '持续',
          last: attr.last,
          lasting: (idxNew)=>{
            return idxNew - start === attr.last - 1
          },
          duringStart: ()=>{
            this.super.attackBindArr.push({
              bind: 'A',
              from: name,
              name: 'yeLan_star2_with_team_attack',
              sequenceArr: [stars2],
              delay: stars2.delay,
              sequenceDelay: stars2.sequenceDelay, //此处代表触发延迟, 越小越先结算
            });
          },
          during: (idxNew)=>{
            return {flag: idxNew - start === attr.during + attr.last - 1}; //last结束后触发
          },
          duringEnd: ()=>{
            if(_.find(this.super.attackBindArr, {name: 'yeLan_star2_with_team_attack'})){
              this.super.attackBindArr.splice(_.findIndex(this.super.attackBindArr, {name: 'yeLan_star2_with_team_attack'}), 1);
            }
            return true;
          }
        });
      }

      return returnList;

    }
  };

  return {
    basic,
    talent,
    action
  }
}