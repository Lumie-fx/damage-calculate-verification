import talentDamage from '../talentDamage'
import _ from 'lodash'

const log = console.log;

export function shenLiLingHua(level, stars, skills=[1,1,1]){

  const name = 'shenLiLingHua';

  const basic = {//lv90
    weaponType: '剑',
    life: 12858,
    attack: 342,
    defend: 784,
    critical: .05,
    criticalDamage: 1.884,
    energyCharge: 1,
    elementType: [0,0,1,0,0,0,0,0],//冰, 物理
    elementMaster: 0,
    elementCharge: [1,1,1,1,1,1,1,1],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
  };

  //2命q触发2个小冰华各20% - todo
  //4命q命中减防30%6s - todo
  //6命z+298% 0.5s/10s - todo

  //天赋0 冲刺附魔 - ok
  //天赋1 e后az+30% - ok
  //天赋2 冲刺附着+18% - ok

  let talentFlag1 = false;
  let talentFlag2 = false;

  const talent = function(){
    if(level >= 20){
      talentFlag1 = true;
    }
    if(level >= 70){
      talentFlag2 = true;
    }
  };

  const action = function(){

    const that = this;

    //冲刺 todo 独立附着冰元素
    this.s = (startIdx) => {

      const start = startIdx; //取第一个
      const attr = {
        cd: 0,
        last: 5,
        sequence: 4,
        during: 50,
      };

      const effect = [{
        from: name,
        name: 's',
        sequence: attr.sequence,
        damageMultiple: 0,
        damageType: 'T', //附着用词
        damageBase: [{base: 'attack', rate: 0, from: name, main: true}],
        attach: {
          element: [0,0,1,0,0,0,0,0],
          type: 'A1s'+name,
          time: 95,
        }
      }];

      //shenLiLingHua
      return [{
        name: 'shenLiLingHua_spurt',
        main: true, //主序的、唯一的、必须存在的
        last: attr.last,
        type: '持续可覆盖',//during duringEnd
        lasting: (idxNew)=>{
          return idxNew - start === attr.last - 1
        },
        duringStart(idxNew){
          let message = `第${idxNew/10}秒，神里绫华使用霰步，短时间内获得冰元素附魔。`
          if(talentFlag2){
            message = `第${idxNew/10}秒，神里绫华使用霰步，短时间内获得冰元素附魔，并获得冰元素伤害提升(天赋2)。`
            that.elementChargeRefine = {
              name: name+'_spurt_charge_18_talent2',
              value: [0,0,.18,0,0,0,0,0],
              type: 'number',
            };
          }
          that.super.note.push({
            type: 'message',
            message,
          });
          that.super.attackAttachRefine = {
            name: 'shenLi_spurt_5s_ice_attackAttach',
            role: 'shenLiLingHua',
            type: 'person',//person / all
            element: [0,0,1,0,0,0,0,0],
            time: 50,
            end: (i_now)=>{
              that.super.note.push({
                type: 'message',
                message: `第${i_now/10}秒，神里绫华冰元素附魔结束。`,
              });
              that.elementChargeRefine = {
                name: name+'_spurt_charge_18_talent2',
                value: [0,0,0,0,0,0,0,0],
                type: 'number',
              };
            }
          };
        },
        during: (idxNew)=>{
          return {flag: idxNew - start === attr.during + attr.last}; //last结束后触发duringEnd
        },
        duringEnd(idxNew){
          return true;
        }
      },{
        name: 'shenLiLingHua_spurt_attach_cryo',
        main: false,  //主序的、唯一的、必须存在的
        last: attr.last,
        lasting: (lastIdx) => {
          return lastIdx - start === attr.last - 1
        },
        type: '单次',
        sequence: (lastIdx) => {
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }]
    }

    this.a = (startIdx) => {

      const start = startIdx;//取第一个
      const attr = {
        cd: 0,
        last: 4,       //todo
        sequenceA: 3,   //todo
      };

      const effect = [{
        from: name,
        name: 'a1',
        sequence: attr.sequenceA,
        damageMultiple: talentDamage.shenLiLingHua.a1[skills[0]-1].base,
        damageType: 'A',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,0,0,0,0,0,0,1],
          type: 'A1'+name,
          time: 95,
        }
      }];

      return [{
        name: name+'_attack_A',
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

    this.az = (startIdx) => {

      // console.log(startIdx)

      const start = startIdx;//取第一个
      const attr = {
        cd: 0,
        last: 16,       //todo
        sequenceA: 3,   //todo
        sequenceZ1: 7,   //todo
        sequenceZ2: 8,   //todo
        sequenceZ3: 9,   //todo
      };

      const effect = [{
        from: name,
        name: 'a1',
        sequence: attr.sequenceA,
        damageMultiple: talentDamage[name].a1[skills[0]-1].base,
        damageType: 'A',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,0,0,0,0,0,0,1],
          type: 'A1_'+name,
          time: 95,
        }
      },{
        from: name,
        name: 'z1',
        sequence: attr.sequenceZ1,
        damageMultiple: talentDamage[name].z[skills[0]-1].base,
        damageType: 'Z',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,0,0,0,0,0,0,1],
          type: 'Az_'+name,
          time: 95,
        },
      },{
        from: name,
        name: 'z2',
        sequence: attr.sequenceZ2,
        damageMultiple: talentDamage[name].z[skills[0]-1].base,
        damageType: 'Z',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,0,0,0,0,0,0,1],
          type: 'Az_'+name,
          time: 95,
        },
      },{
        from: name,
        name: 'z3',
        sequence: attr.sequenceZ3,
        damageMultiple: talentDamage[name].z[skills[0]-1].base,
        damageType: 'Z',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,0,0,0,0,0,0,1],
          type: 'Az_'+name,
          time: 95,
        },
      }];

      return [{
        name: 'huTao_attack_AZ',
        main: true,  //主序的、唯一的、必须存在的
        last: attr.last,
        lasting: (lastIdx) => {
          return lastIdx - start === attr.last - 1
        },
        type: '多次',
        sequence: (lastIdx) => {
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }]
    }

    this.e = (startIdx) => {

      const start = startIdx;//取第一个
      const attr = {
        cd: 100,
        last: 8,       //todo
        during: 60,
        sequence: 8,   //todo
      };

      const effect = [{
        from: name,
        name: 'e',
        sequence: attr.sequence,
        damageMultiple: talentDamage[name].e[skills[1]-1].base,
        damageType: 'E',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,0,1,0,0,0,0,0],
          type: 'B'+name.toLowerCase(),
          time: 120,
        }
      }];

      let sequenceArr = [{
        name: name+'_skill_E',
        main: true,  //主序的、唯一的、必须存在的
        last: attr.last,
        lasting: (lastIdx) => {
          return lastIdx - start === attr.last - 1
        },
        type: '单次',
        sequence: (lastIdx) => {
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }];

      if(talentFlag1){
        sequenceArr.push({
          name: name+'_skill_E_az30_talent1',
          main: false, //主序的、唯一的、必须存在的
          last: attr.last,
          type: '持续',//during duringEnd
          lasting: (idxNew)=>{
            return idxNew - start === attr.last - 1
          },
          duringStart: (idxNew)=>{
            this.super.note.push({
              type: 'message',
              message: `第${idxNew/10}秒，神里绫华使用神里流·冰华，受天赋1的影响，攻击伤害得到提升。`,
            });
            //攻击加成
            this.increaseAddOnRefine = {
              name: name+'_talent_1',
              effect: {
                effectAction: [1,1,0,0,0],
                effectWeaponType: [1,1,1,1,1],
                effectArea: 'elementCharge',
                effectElement: [1,1,1,1,1,1,1,1],
                attachedBy: [0,0,0,0,0,0,0,0],
                effectValue: .3,
              },
              timeCount: 10000
            };
          },
          during: (idxNew)=>{
            return {flag: idxNew - start === attr.during + attr.last}; //last结束后触发duringEnd
          },
          duringEnd: (idxNew)=>{
            this.super.note.push({
              type: 'message',
              message: `第${idxNew/10}秒，神里绫华攻击提升恢复。`,
            });
            this.increaseAddOnRefine = {
              name: name+'_talent_1',
              effect: {
                effectAction: [1,1,0,0,0],
                effectWeaponType: [1,1,1,1,1],
                effectArea: 'elementCharge',
                effectElement: [1,1,1,1,1,1,1,1],
                attachedBy: [0,0,0,0,0,0,0,0],
                effectValue: 0,
              },
              timeCount: 10000
            };
            return true;
          }
        });
      }

      return sequenceArr;
    }

    this.q = (startIdx) => {

    }
  };

  return {
    basic,
    talent,
    action
  }
}