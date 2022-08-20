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

  //2命q触发2个小冰华各20% - ok
  //4命q命中减防30%6s - ok
  //6命z+298% 0.5s/10s - ok

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

    if(stars >= 4){
      this.eventTrigger.push({
        type: '1',
        name: name+'_star4_defendMinus',
        // bindAction: 'Q',
        reward: () => {
          this.super.defendMitigationRefine = {
            name: name+'_star4_defendMinus_30%',
            value: .3,
          };
          this.duration = 60;//刷新持续时间
        },
        duration: 60,
        durationEnd:() => {
          this.super.defendMitigationRefine = {
            name: name+'_star4_defendMinus_30',
            value: 0,
          };
        }
      });
    }

    if(stars >= 6){
      const that = this;
      this.eventTrigger.push({ //$003
        type: '2',
        from: name,
        name: 'role_'+name+'_star6_attack_Z',
        bindAction: 'Z',
        reward(idx){
          // log(idx,'reward',this.name)
          that.increaseAddOnRefine = {
            name: 'role_'+name+'_star6_attack_z_charge_298%',
            effect: {
              effectAction: [0,1,0,0,0],
              effectWeaponType: [1,1,1,1,1],
              effectArea: 'elementCharge',
              effectElement: [1,1,1,1,1,1,1,1],
              attachedBy: [0,0,0,0,0,0,0,0],
              effectValue: 2.98
            },
            timeCount: 10000
          };
        },
        isCd: false,
        open: false,
        duration: 6, //实际-1
        cd: 101,      //实际-1
        durationEnd(){
          that.increaseAddOnRefine = {
            name: 'role_'+name+'_star6_attack_z_charge_298%',
            effect: {
              effectAction: [0,1,0,0,0],
              effectWeaponType: [1,1,1,1,1],
              effectArea: 'elementCharge',
              effectElement: [1,1,1,1,1,1,1,1],
              attachedBy: [0,0,0,0,0,0,0,0],
              effectValue: 0
            },
            timeCount: 10000
          };

          this.duration = 6;//刷新持续时间
          this.open = false;
        },
        cdEnd(){
          this.cd = 101;
          this.isCd = false;
        }
      });
    }
  };

  const shuangMieSequence = {
    from: name,
    name: '霜灭',
    sequence: 1,
    damageMultiple: talentDamage[name].q[skills[2]-1].base,
    damageType: 'Q',
    damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
    attach: {
      element: [0,0,1,0,0,0,0,0],
      type: 'A_linghua_q',
      time: 95,
    },
    lockedAttr: null,
  };

  const shuangMieSequenceFinal = {
    from: name,
    name: '霜灭·绽放',
    sequence: 1,
    damageMultiple: talentDamage[name].q[skills[2]-1].final,
    damageType: 'Q',
    damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
    attach: {
      element: [0,0,1,0,0,0,0,0],
      type: 'A_linghua_q',
      time: 95,
    },
    lockedAttr: null,
  };

  const shuangMie = (attr, that) => {
    return {
      name: name+'_skill_Q_shuangMie',
      main: false,  //主序的、唯一的、必须存在的
      last: 50,     //霜灭持续时间
      //lastStartTime, //duringStart, 循环内会补充, 上次生效时间
      //endTime,       //duringStart, 循环内会补充, 次序结束时间
      justSecond: 2, //单独处理, 为了5s/20=2.5取整
      type: '延迟伤害',
      lasting(idxNew){
        return idxNew >= this.endTime;
      },
      duringStart(idxNew){
        //初次不生效
        // const z_effect_time = attr.sequenceZ; //这个是重击触发的轴
        this.endTime = attr.last + idxNew + this.last;//last 18是q后霜灭生成的时间
        this.lastStartTime = idxNew + attr.last;
        //锁面板
        shuangMieSequence.lockedAttr = _.cloneDeep(that.refineAttr);
        shuangMieSequenceFinal.lockedAttr = _.cloneDeep(that.refineAttr);
      },
      // refresh(idxNew){ //搜 type === '延迟伤害'
      //   this.endTime = this.last + idxNew;
      // },
      during(idxNew){//最新的时间
        let flag = false;
        let sequence = shuangMieSequence;
        if(idxNew - (this?.lastStartTime||0) >= this.justSecond){ //0.3s渐次触发时间
          this.justSecond = this.justSecond === 2 ? 3 : 2;
          this.lastStartTime = idxNew;
          flag = true;
        }
        if(idxNew === this?.endTime){
          sequence = shuangMieSequenceFinal;
        }
        if(stars >= 2){
          const smallOne = Object.assign(_.cloneDeep(sequence),{damageBase:[{base: 'attack', rate: .2, from: name, main: true}]});
          sequence = [sequence, smallOne, smallOne];
        }
        if(stars >= 4 && flag){
          _.find(that.eventTrigger, {name: name+'_star4_defendMinus'}).reward();
        }
        return {
          flag,
          sequence,
        }; //中间触发时间
      },
      duringEnd(idxNew){
        return this.lasting(idxNew);
      }
    }
  };


  const action = function(){

    const that = this;

    //冲刺 todo 计算时改0伤害描述
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
        cd: attr.cd,
        last: attr.last,
        type: '持续可覆盖',//during duringEnd
        lasting: (idxNew)=>{
          return idxNew - start >= attr.last - 1
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
        cd: attr.cd,
        last: attr.last,
        lasting: (lastIdx) => {
          return lastIdx - start >= attr.last - 1
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
        cd: attr.cd,
        last: attr.last,
        lasting: (lastIdx) => {
          return lastIdx - start >= attr.last - 1
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
        sequence: 7,   //todo
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
        cd: attr.cd,
        last: attr.last,
        lasting: (lastIdx) => {
          return lastIdx - start >= attr.last - 1;
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
              message: `第${idxNew/10}秒，神里绫华通过神里流·冰华提升的攻击加成恢复。`,
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

      const start = startIdx; //取第一个
      const attr = {
        cd: 200,
        last: 18,
        // sequence: 8,
        during: 50,
      };

      const effect = [{
        from: name,
        name: 'q_start',
        sequence: 10000,     // 0~7 对应的last=8为末尾   todo 具体帧
        damageMultiple: 0,
        damageBase: [],
        damageType: 'Q',
        attach: {
          element: [0,0,1,0,0,0,0,0],
          type: 'C_linghua',
          time: 95,
        }
      }];

      return [{
        name: name+'_skill_Q_start',
        main: true, //主序的、唯一的、必须存在的
        cd: attr.cd,
        last: attr.last,
        lasting: (lastIdx)=>{
          return lastIdx - start >= attr.last - 1;
        },
        type: '单次',
        sequence: (lastIdx) => {
          if(lastIdx - start === attr.last - 1){
            this.super.note.push({
              type: 'message',
              message: `第${lastIdx/10}秒，神里绫华施放神里流·霜灭，造成冰刃切割伤害。`,
            });
          }
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }, shuangMie(attr, that)]

    }
  };

  return {
    basic,
    talent,
    action
  }
}