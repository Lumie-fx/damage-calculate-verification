import talentDamage from '../talentDamage'
import _ from 'lodash'

const log = console.log;

export function zhongLi(level, stars, skills=[1,1,1]){

  const name = 'zhongLi';

  const basic = {//lv90
    weaponType: '枪',
    life: 14695,
    attack: 251,
    defend: 738,
    critical: .05,
    criticalDamage: 1.5,
    energyCharge: 1,
    elementType: [0,0,0,0,0,1,0,0],//岩, 物理
    elementMaster: 0,
    elementCharge: [1,1,1,1,1,1.288,1,1],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
  };

  //1命2个e todo 共鸣流  - 多个岩脊/岩创造物
  //2命q触发护盾 - ok

  const damageBase = {
    e: [{base: 'attack', rate: 1, from: name, main: true}],
    el: [{base: 'attack', rate: 1, from: name, main: true}],
    gongMing: [{base: 'attack', rate: 1, from: name, main: true}],
    q: [{base: 'attack', rate: 1, from: name, main: true}],
  };

  //天赋2aeq 附加生命的增伤
  const talent = function(){
    if(level >= 70){
      damageBase.e.push({base: 'life', rate: .019, from: name});
      damageBase.el.push({base: 'life', rate: .019, from: name});
      damageBase.gongMing.push({base: 'life', rate: .019, from: name});
      damageBase.q.push({base: 'life', rate: .33, from: name});
    }
  };

  const gongMingSequence = {
    from: name,
    name: '岩脊共鸣',
    sequence: 1,
    damageMultiple: talentDamage.zhongLi.e[skills[1]-1].gongMing,
    damageType: 'E',
    damageBase: damageBase.gongMing,
    attach: {
      element: [0,0,0,0,0,1,0,0],
      type: 'A_zl',
      time: 95,
    },
    lockedAttr: null,
  };

  const gongMing = (attr, that) => {
    return {
      name: 'zhongLi_skill_E_gongMing',
      main: false,  //主序的、唯一的、必须存在的
      last: 300,     //共鸣持续时间
      //lastStartTime, //duringStart, 循环内会补充, 上次生效时间
      //endTime,       //duringStart, 循环内会补充, 次序结束时间
      type: '延迟伤害',
      lasting(idxNew){
        return idxNew >= this.endTime;
      },
      duringStart(idxNew){
        //初次不生效
        // const z_effect_time = attr.sequenceZ; //这个是重击触发的轴
        this.endTime = this.last + idxNew + attr.sequenceEL;//todo 8是长e后岩脊生成的时间
        this.lastStartTime = idxNew + attr.sequenceEL;
        //锁面板
        gongMingSequence.lockedAttr = _.cloneDeep(that.super[name].refineAttr);
      },
      // refresh(idxNew){ //搜 type === '延迟伤害'
      //   this.endTime = this.last + idxNew;
      // },
      during(idxNew){//最新的时间
        let flag = false;
        if(idxNew - (this?.lastStartTime||0) >= 19){ //1.9s渐次触发时间
          this.lastStartTime = idxNew;
          flag = true;
          // console.log('岩脊共鸣触发');
        }
        return {
          flag,
          sequence: gongMingSequence
        }; //中间触发时间
      },
      duringEnd(idxNew){
        return this.lasting(idxNew);
      }
    }
  };

  const action = function(){

    const that = this;

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
        damageBase: damageBase.el,
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
        cd: attr.cd,
        last: attr.last,
        lasting: (lastIdx)=>{
          return lastIdx - start >= attr.last - 1
        },
        type: '单次',
        sequence: (lastIdx) => {
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }, {
        name: 'zhongLi_skill_E_resistance_20%',
        main: false, //主序的、唯一的、必须存在的
        last: attr.last,
        type: '持续',//during duringEnd
        lasting: (idxNew)=>{
          return idxNew - start === attr.last - 1
        },
        duringStart: (idxNew)=>{
          this.super.noteList.push({
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
      }, gongMing(attr, that)]
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
        damageBase: damageBase.q,
        attach: {
          element: [0,0,0,0,0,1,0,0],
          type: 'B',
          time: 170,
        },
      }];

      return [{
        name: 'zhongLi_skill_Q',
        main: true, //主序的、唯一的、必须存在的
        cd: attr.cd,
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
              that.super.noteList.push({
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