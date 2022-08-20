import talentDamage from '../talentDamage'
import _ from 'lodash'

const log = console.log;

export function shenHe(level, stars, skills=[1,1,1]){

  const name = 'shenHe';

  const basic = {//lv90
    weaponType: '枪',
    life: 12993,
    attack: 304,
    defend: 830,
    critical: .05,
    criticalDamage: 1.5,
    energyCharge: 1,
    elementType: [0,0,1,0,0,0,0,0],//岩, 物理
    elementMaster: 0,
    elementCharge: [1,1,1,1,1,1,1,1],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
  };

  //1命2个e - todo
  //2命q+6s, 场上冰爆伤+15% - todo
  //4命+每层冰凌叠1/50层5%e伤害 - todo
  //6命az不消耗冰凌 - todo


  const talent = function(){

    //突破百分比攻击力
    this.attackRefine = {name: 'shenHe_talent_lv_up_attack', value: .288, type: 'percent'};

    //天赋1 q中场上角色冰伤+15% - todo
    if(level >= 20){

    }
    //天赋2 短e后eq+15%/10s, 长e后azd+15%/15s - todo
    if(level >= 70){

    }
  };


  //e azdeq + 攻击

  const action = function(){

    const that = this;

    this.e = (startIdx) => {

      const start = startIdx; //取第一个
      const attr = {
        cd: 100,
        last: 5,
        sequenceBuff: 1,
        sequence: 3,   //todo 具体帧
        during: 100,
      };

      const effect = [{
        from: name,
        name: 'e_shenhe',
        sequence: attr.sequence,     // 0~7 对应的last=8为末尾
        damageMultiple: talentDamage[name].e[skills[1]-1].base,
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        damageType: 'E',
        attach: {
          element: [0,0,1,0,0,0,0,0],
          type: 'B_sh',
          time: 95,
        }
      }];

      return [{
        name: 'shenHe_skill_E_short',
        main: true, //主序的、唯一的、必须存在的
        last: attr.last,
        lasting: (lastIdx)=>{
          return lastIdx - start >= attr.last - 1
        },
        type: '单次',
        sequence: (lastIdx) => {
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }, {
        name: 'shenHe_skill_E_short_buff',
        main: false, //主序的、唯一的、必须存在的
        last: attr.last,
        type: '持续',//during duringEnd
        lasting: (idxNew)=>{
          return idxNew - start === attr.last - 1
        },
        duringStart: (idxNew)=>{
          this.super.note.push({
            type: 'message',
            message: `第${idxNew/10}秒，钟离生成玉璋护盾，怪物所有抗性降低20%。`,
          });
          that.super.resistanceMitigationRefine = {
            name: 'zhongLi_e_long_resistance_20%',
            value: new Array(8).fill(.2),
            type: 'number',
          };
          that.super.shieldRefine = {type:'岩', name: 'zhongLi_E', time: 300};
        },
        during: (idxNew)=>{
          return {flag: idxNew - start === attr.during + attr.sequenceEL}; //last结束后触发duringEnd
        },
        duringEnd: (idxNew)=>{
          that.super.resistanceMitigationRefine = {
            name: 'zhongLi_e_long_resistance_20%',
            value: new Array(8).fill(0),
            type: 'number',
          };
          return true;
        }
      }]
    }

    this.el = (startIdx) => {

      const start = startIdx; //取第一个
      const attr = {
        cd: 120,
        last: 15,
        sequenceEL: 8,
        during: 300,
      };

      const effect = [{
        from: name,
        name: 'el',
        sequence: attr.sequenceEL,     // 0~7 对应的last=8为末尾   todo 具体帧
        damageMultiple: talentDamage.zhongLi.el[skills[1]-1].base,
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        damageType: 'E',
        attach: {
          element: [0,0,0,0,0,1,0,0],
          type: 'A_zl',
          time: 95,
        }
      }];

      return [{
        name: 'zhongLi_skill_E_long',
        main: true, //主序的、唯一的、必须存在的
        last: attr.last,
        lasting: (lastIdx)=>{
          return lastIdx - start >= attr.last - 1
        },
        type: '单次',
        sequence: (lastIdx) => {
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }]
    }

    this.q = (startIdx) => {

      //todo
      //2命触发护盾

      const start = startIdx; //取第一个
      const attr = {
        cd: 120,
        last: 21,
        sequence: 16, //todo
      };


      const effect = [{
        from: name,
        name: 'q',
        elementAmount: 40,   //能量
        sequence: attr.sequence,
        damageMultiple: talentDamage.zhongLi.q[skills[2]-1].base,
        damageType: 'Q',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,0,0,0,0,1,0,0],
          type: 'B',
          time: 170,
        },
      }];

      return [{
        name: 'zhongLi_skill_Q',
        main: true, //主序的、唯一的、必须存在的
        last: attr.last,
        lasting: (lastIdx)=>{
          return lastIdx - start >= attr.last - 1
        },
        type: '单次',
        sequence: (lastIdx) => {
          if(stars >= 2){
            if(startIdx + attr.sequence === lastIdx){
              that.super.resistanceMitigationRefine = {
                name: 'zhongLi_e_long_resistance_20%',
                value: new Array(8).fill(.2),
                type: 'number',
              };
              that.super.shieldRefine = {type:'岩', name: 'zhongLi_E', time: 300};
              that.super.note.push({
                type: 'message',
                message: `第${lastIdx/10}秒，钟离释放天星，由于2命效果，生成玉璋护盾，怪物所有抗性降低20%。`,
              });
            }
          }
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }]

    }
  };

  return {
    basic,
    talent,
    action
  }
}