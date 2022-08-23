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

  let talentFlag1 = false;
  let talentFlag2 = false;

  const talent = function(){

    const skillFreeObj = {
      name: 'shenHe-e',
      cd: 100,
      cdCount: 0,
    };

    if(stars === 0){
      skillFreeObj.num = 1;
      skillFreeObj.numMax = 1;
    }else{
      skillFreeObj.num = 2;
      skillFreeObj.numMax = 2;
    }

    this.super.skillFree.push(skillFreeObj);

    //突破百分比攻击力
    this.attackRefine = {name: 'shenHe_talent_lv_up_attack', value: .288, type: 'percent'};

    //天赋1 q中场上角色冰伤+15% - todo
    if(level >= 20){
      talentFlag1 = true;
    }
    //天赋2 短e后eq+15%/10s, 长e后azd+15%/15s - todo
    if(level >= 70){
      talentFlag2 = true;
    }
  };

  const shortEEffect = {
    effectArea: 'attackArea',
    effectElement: [0,0,1,0,0,0,0,0],
    effectValue: {base: 'attack', rate: talentDamage[name].e[skills[1]-1].add, from: name+'_short_e', role: name},
    times: 5,
    timesMinusArr: [1,1,1,1,1], // --注释
  };
  const shortETalent1Effect = {
    effectArea: 'elementCharge',
    effectAction: [0,0,0,1,1],
    effectValue: .15,
  };
  const longEEffect = {
    effectArea: 'attackArea',
    effectElement: [0,0,1,0,0,0,0,0],
    effectValue: {base: 'attack', rate: talentDamage[name].e[skills[1]-1].add, from: name+'_long_e', role: name},
    times: 7,
    timesMinusArr: [1,1,1,1,1], // --注释
  };
  const longETalent1Effect = {
    effectArea: 'elementCharge',
    effectAction: [1,1,1,0,0],
    effectValue: .15,
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
            message: `第${idxNew/10}秒，申鹤点按仰灵威召将役咒，所有冰元素伤害获得加成。`,
          });
          this.super.teamRefine('all',name+'_e_short_addon_attack', {
            name: 'increaseAddOn',
            value: {
              name: `role_${name}_e_short_addon_attack`,
              effect: shortEEffect,
              timeCount: 100
            }
          });
          this.super.teamRefine('all',name+'_e_short_charge_15%', {
            name: 'increaseAddOn',
            value: {
              name: `role_${name}_e_short_charge_15%`,
              effect: shortETalent1Effect,
              timeCount: 100
            }
          });
        },
        during: (idxNew)=>{
          return {flag: idxNew - start === attr.during + attr.sequence}; //last结束后触发duringEnd
        },
        duringEnd: (idxNew)=>{
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