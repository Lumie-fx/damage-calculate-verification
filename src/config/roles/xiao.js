import talentDamage from '../talentDamage'
import _ from 'lodash'

const log = console.log;

export function xiao(level, stars, skills=[1,1,1]){

  const name = 'xiao';

  const basic = {//lv90
    weaponType: '枪',
    life: 12736,
    attack: 349,
    defend: 799,
    critical: .242,
    criticalDamage: 1.5,
    energyCharge: 1,
    elementType: [0,0,0,0,1,0,0,0],//风, 物理
    elementMaster: 0,
    elementCharge: [1,1,1,1,1,1,1,1],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
  };

  //1命3个e todo
  //6命手法改变 todo

  let isTalent1 = false;
  let isTalent2 = false;
  //天赋2aeq 附加生命的增伤
  const talent = function(){

    const that = this;

    const skillFreeObj = {
      name: 'xiao-e',
      cd: 100,
      cdCount: 0,
    };

    if(stars === 0){
      skillFreeObj.num = 2;
      skillFreeObj.numMax = 2;
    }else{
      skillFreeObj.num = 3;
      skillFreeObj.numMax = 3;
    }

    this.super.skillFree.push(skillFreeObj);

    //天赋1 q后5% 3s+5% max25% q结束清除效果
    if(level >= 20){
      isTalent1 = true;
    }
    //e后7s e+15% max3次45%
    if(level >= 70){
      isTalent2 = true;
      this.eventTrigger.push({
        type: '1',
        name: 'xiao_talent2_skillE_charge',
        bindAction: 'E',
        reward(){
          // log('xiao_talent2_skillE_charge'+'| reward'+'|' + this.now);
          // log(_.cloneDeep(that.refineAttr.increaseAddOn))
          if(this.now < this.max){
            this.now ++;
          }else{
            this.now = this.max;
          }
          that.increaseAddOnRefine = {
            name: 'xiao_talent2_skillE_charge_15%',
            effect: {
              effectAction: [0,0,0,1,0],
              effectWeaponType: [1,1,1,1,1],
              effectArea: 'elementCharge',
              effectElement: [1,1,1,1,1,1,1,1],
              attachedBy: [0,0,0,0,0,0,0,0],
              effectValue: .15 * this.now
            },
            timeCount: 10000
          };
          this.duration = 70;//刷新持续时间
        },
        now: 0,
        max: 3,
        duration: 70,
        durationEnd(){
          this.now = 0;
          that.increaseAddOnRefine = {
            name: 'xiao_talent2_skillE_charge_15%',
            effect: {
              effectAction: [0,0,0,1,0],
              effectWeaponType: [1,1,1,1,1],
              effectArea: 'elementCharge',
              effectElement: [1,1,1,1,1,1,1,1],
              attachedBy: [0,0,0,0,0,0,0,0],
              effectValue: 0
            },
            timeCount: 10000
          };
        }
      });
    }
  };

  const action = function(){

    const that = this;

    //imp 只算q后风伤
    this.d = (startIdx) => {

      const start = startIdx;//取第一个
      const attr = {
        cd: 0,
        last: 13,        //todo
        sequenceDS: 9,   //todo
        sequenceD: 11,   //todo
      };

      const effect = [{
        from: name,
        name: 'ds',
        sequence: attr.sequenceDS,
        damageMultiple: talentDamage.xiao.d[skills[0]-1].sky,
        damageType: 'D',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,0,0,0,1,0,0,0],
          type: 'C_xiao_ds',
          time: 95,
        }
      },{
        from: name,
        name: 'd',
        sequence: attr.sequenceD,
        damageMultiple: talentDamage.xiao.d[skills[0]-1].base,
        damageType: 'D',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,0,0,0,1,0,0,0],
          type: 'B_xiao_d',
          time: 95,
        },
      }];

      return [{
        name: 'xiao_attack_DS_D',
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
    };

    this.e = (startIdx) => {

      const start = startIdx; //取第一个
      const attr = {
        cd: 100,
        last: 3,
        sequence: 1, //todo
      };

      const effect = [{
        from: name,
        name: 'e',
        sequence: attr.sequence,
        damageMultiple: talentDamage.xiao.e[skills[1]-1].base,
        damageType: 'E',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,0,0,0,1,0,0,0],
          type: 'A_xiao_e',
          time: 95,
        },
      }];

      return [{
        name: 'xiao_skill_E',
        main: true, //主序的、唯一的、必须存在的
        cd: attr.cd,
        last: attr.last,
        lasting: (lastIdx)=>{
          return lastIdx - start >= attr.last - 1
        },
        type: '单次',
        sequence: (lastIdx) => {
          //                                   + 1 (e之后触发)
          if(lastIdx - start === attr.sequence + 1 && isTalent2){
            // log(that.eventTrigger.length)
            that.eventTrigger.filter(res => res.bindAction === 'E' && res.name === 'xiao_talent2_skillE_charge').forEach(res => {
              res.reward();
            });

          }
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }]
    }

    this.q = (startIdx) => {

      const start = startIdx; //取第一个
      const attr = {
        cd: 180,
        last: 12,
        during: 156, //6是后摇补偿
      };

      return [{
        name: 'xiao_skill_Q',
        main: true, //主序的、唯一的、必须存在的
        cd: attr.cd,
        last: attr.last,
        type: '持续',//during duringEnd
        lasting: (idxNew)=>{
          return idxNew - start >= attr.last - 1
        },
        duringStart: (idxNew)=>{
          this.super.noteList.push({
            type: 'message',
            message: `第${idxNew/10}秒，魈使用靖妖傩舞，普通攻击、重击、下落攻击伤害提升，并转化为风元素伤害。`,
          });

          //加成
          this.increaseAddOnRefine = {
            name: 'xiao_skillQ_benefit',
            effect: {
              effectAction: [1,1,1,0,0],
              effectWeaponType: [1,1,1,1,1],
              effectArea: 'elementCharge',
              effectElement: [1,1,1,1,1,1,1,1],
              attachedBy: [0,0,0,0,0,0,0,0],
              effectValue: talentDamage.xiao.q[skills[2]-1].base,
            },
            timeCount: 10000
          };
          //队友切换立即结束
          this.super.teamSwitchEndFuncArr.push(()=>{
            this.increaseAddOnRefine = {
              name: 'xiao_skillQ_benefit',
              effect: {
                effectAction: [1,1,1,0,0],
                effectWeaponType: [1,1,1,1,1],
                effectArea: 'elementCharge',
                effectElement: [1,1,1,1,1,1,1,1],
                attachedBy: [0,0,0,0,0,0,0,0],
                effectValue: 0,
              },
              timeCount: 10000
            };
            if(isTalent1){
              this.elementChargeRefine = {
                name: 'xiao_talent1_self_increase_damage_5_25',
                value: new Array(8).fill(0),
                type: 'number',
              };
            }
          });

          if(isTalent1){
            this.elementChargeRefine = {
              name: 'xiao_talent1_self_increase_damage_5_25',
              value: new Array(8).fill(.05),
              type: 'number',
            };
          }
        },
        during: (idxNew)=>{
          //自身每30个idx进行一次增长
          const effectTime = idxNew - start; // 0~154
          // log(effectTime)
          if(effectTime >= 0 && effectTime % 30 === 0){
            //idxNew - start - attr.last   0~149
            let increase = Math.floor(effectTime / 30) * .05 + .05;//初始1层
            if(increase >= .25){
              increase = .25;
            }
            // log('increase:'+increase)
            this.elementChargeRefine = {
              name: 'xiao_talent1_self_increase_damage_5_25',
              value: new Array(8).fill(increase),
              type: 'number',
            };
          }
          return {flag: idxNew - start === attr.during + attr.last - 1}; //last结束后触发duringEnd
        },
        duringEnd: (idxNew)=>{
          this.super.noteList.push({
            type: 'message',
            message: `第${idxNew/10}秒，魈靖妖傩舞状态结束，加成恢复。`,
          });
          this.increaseAddOnRefine = {
            name: 'xiao_skillQ_benefit',
            effect: {
              effectAction: [1,1,1,0,0],
              effectWeaponType: [1,1,1,1,1],
              effectArea: 'elementCharge',
              effectElement: [1,1,1,1,1,1,1,1],
              attachedBy: [0,0,0,0,0,0,0,0],
              effectValue: 0,
            },
            timeCount: 10000
          };
          if(isTalent1){
            this.elementChargeRefine = {
              name: 'xiao_talent1_self_increase_damage_5_25',
              value: new Array(8).fill(0),
              type: 'number',
            };
          }
          return true;
        }
      }]

    }
  };

  return {
    basic,
    talent,
    action
  }
}