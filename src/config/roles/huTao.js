import talentDamage from '../talentDamage'
import _ from 'lodash'

const log = console.log;

export function huTao(level, stars, skills=[1,1,1]){

  const name = 'huTao';

  const basic = {//lv90
    weaponType: '枪',
    life: 15552,
    attack: 106,
    defend: 876,
    critical: .05,
    criticalDamage: 1.884,
    energyCharge: 1,
    elementType: [0,1,0,0,0,0,0,0],//'火', 物理
    elementMaster: 0,
    elementCharge: [1,1,1,1,1,1,1,1],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
  };

  const talent = function(){
    //天赋2.半血+.33火伤,定为全程半血,全程吃到效果
    if(level >= 70){
      this.elementChargeRefine = {name: 'huTao_talent2_elementCharge', value: [0,.33,0,0,0,0,0,0], type: 'number'};
      // log(this)
    }
  };

  const teamTalent = function(){
    //天赋1.e结束后,队友加.12暴击,持续8s/16s,定为队友全程+ .06   常驻
    //队友加成
    if(level >= 20){
      this.super.teamRefine('others', 'huTao', {
        name: 'critical',
        value: {name: 'huTao_talent1_critical', value: .06, type: 'number'}
      });
    }

    //4命:队友加.12暴击 常驻
    if(stars >= 4){
      this.super.teamRefine('others', 'huTao', {
        name: 'critical',
        value: {name: 'huTao_stars4_critical', value: .12, type: 'number'}
      });
    }
  };

  //todo
  //雪梅香 --ok
  //0命:手法aaaz跳
  //1命:手法解锁e + 10az闪/8aaz闪 + q
  //2命:雪梅香伤害增加生命的10% --ok 计算注意
  const damageBase = [{base: 'attack', rate: 1, from: name, main: true}];
  if(stars >= 2){
    damageBase.push({base: 'life', rate: .1, from: name});
  }
  //6命:核爆玩法

  const xueMeiXiang = {
    from: name,
    name: '雪梅香',
    sequence: 6,
    damageMultiple: talentDamage.huTao.e[skills[1]-1].xueMeiXiang,
    damageType: 'E',
    damageBase,
    attach: {
      element: [0,1,0,0,0,0,0,0],
      type: 'B',
      time: 95,
    },
  };

  const getXueMeiXiang = (attr) => {
    return {
      name: 'huTao_skill_E_xueMeiXiang',
      main: false,  //主序的、唯一的、必须存在的
      last: 80,     //雪梅香持续时间
      //lastStartTime, //duringStart, 循环内会补充, 上次生效时间
      //endTime,       //duringStart, 循环内会补充, 次序结束时间
      type: '延迟伤害',
      lasting(idxNew){
        return idxNew >= this.endTime;
      },
      duringStart(idxNew){
        //初次不生效
        const z_effect_time = attr.sequenceZ; //这个是重击触发的轴
        this.endTime = this.last + idxNew;
        this.lastStartTime = idxNew + z_effect_time;
        // console.log('雪梅香生效/刷新')
      },
      refresh(idxNew){ //搜 type === '延迟伤害'
        this.endTime = this.last + idxNew;
      },
      during(idxNew){//最新的时间
        let flag = false;
        if(idxNew - (this?.lastStartTime||0) === 40){ //40为渐次触发时间
          this.lastStartTime = idxNew;
          flag = true;
          console.log('雪梅香触发');
        }
        return {
          flag,
          sequence: xueMeiXiang
        }; //中间触发时间
      },
      duringEnd(idxNew){
        return this.lasting(idxNew);
      }
    }
  };

  const action = function(){

    this.a = (startIdx) => {

      // console.log(startIdx)

      const start = startIdx;//取第一个
      const attr = {
        cd: 0,
        last: 4,       //todo
        sequenceA: 2,   //todo
      };

      const effect = [{
        from: name,
        name: 'a1',
        sequence: attr.sequenceA,
        damageMultiple: talentDamage.huTao.a1[skills[0]-1].base,
        damageType: 'A',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,1,0,0,0,0,0,0],
          type: 'A1'+name,
          time: 95,
        }
      }];

      return [{
        name: 'huTao_attack_A',
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
    }

    this.az = (startIdx) => {

      // console.log(startIdx)

      const start = startIdx;//取第一个
      const attr = {
        cd: 0,
        last: 9,       //todo
        sequenceA: 2,   //todo
        sequenceZ: 6,   //todo
      };

      const effect = [{
        from: name,
        name: 'a1',
        sequence: attr.sequenceA,
        damageMultiple: talentDamage.huTao.a1[skills[0]-1].base,
        damageType: 'A',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,1,0,0,0,0,0,0],
          type: 'A1'+name,
          time: 95,
        }
      },{
        from: name,
        name: 'z',
        sequence: attr.sequenceZ,
        damageMultiple: talentDamage.huTao.z[skills[0]-1].base,
        damageType: 'Z',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,1,0,0,0,0,0,0],
          type: 'B',
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
      }, getXueMeiXiang(attr)]
    }

    this.aaz = (startIdx) => {
      const start = startIdx;//取第一个

      const attr = {
        cd: 0,
        last: 12,       //todo
        sequenceA1: 2,   //todo
        sequenceA2: 5,   //todo
        sequenceZ: 9,   //todo
      };

      const effect = [{
        from: name,
        name: 'a1',
        sequence: attr.sequenceA1,
        damageMultiple: talentDamage.huTao.a1[skills[0]-1].base,
        damageType: 'A',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,1,0,0,0,0,0,0],
          type: 'A1'+name,
          time: 95,
        }
      },{
        from: name,
        name: 'a2',
        sequence: attr.sequenceA2,
        damageMultiple: talentDamage.huTao.a2[skills[0]-1].base,
        damageType: 'A',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,1,0,0,0,0,0,0],
          type: 'A1'+name,
          time: 95,
        }
      },{
        from: name,
        name: 'z',
        sequence: attr.sequenceZ,
        damageMultiple: talentDamage.huTao.z[skills[0]-1].base,
        damageType: 'Z',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,1,0,0,0,0,0,0],
          type: 'B',
          time: 95,
        },
      }];

      return [{
        name: 'huTao_attack_AAZ',
        main: true,  //主序的、唯一的、必须存在的
        last: attr.last,
        lasting: (lastIdx) => {
          return lastIdx - start === attr.last - 1
        },
        type: '多次',
        sequence: (lastIdx) => {
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }, getXueMeiXiang(attr)]
    }

    this.aaaz = (startIdx) => { //0命的, 带跳跃可
      const start = startIdx;//取第一个
      const attr = {
        cd: 0,
        last: 18,       //todo
        sequenceA1: 2,   //todo
        sequenceA2: 6,   //todo
        sequenceA3: 10,   //todo
        sequenceZ: 14,   //todo
      };

      const effect = [{
        from: name,
        name: 'a1',
        sequence: attr.sequenceA1,
        damageMultiple: talentDamage.huTao.a1[skills[0]-1].base,
        damageType: 'A',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,1,0,0,0,0,0,0],
          type: 'A1'+name,
          time: 95,
        }
      },{
        from: name,
        name: 'a2',
        sequence: attr.sequenceA2,
        damageMultiple: talentDamage.huTao.a2[skills[0]-1].base,
        damageType: 'A',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,1,0,0,0,0,0,0],
          type: 'A1'+name,
          time: 95,
        }
      },{
        from: name,
        name: 'a3',
        sequence: attr.sequenceA3,
        damageMultiple: talentDamage.huTao.a3[skills[0]-1].base,
        damageType: 'A',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,1,0,0,0,0,0,0],
          type: 'A1'+name,
          time: 95,
        }
      },{
        from: name,
        name: 'z',
        sequence: attr.sequenceZ,
        damageMultiple: talentDamage.huTao.z[skills[0]-1].base,
        damageType: 'Z',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,1,0,0,0,0,0,0],
          type: 'B',
          time: 95,
        },
      }];

      return [{
        name: 'huTao_attack_AAAZ',
        main: true,  //主序的、唯一的、必须存在的
        last: attr.last,
        lasting: (lastIdx) => {
          return lastIdx - start === attr.last - 1
        },
        type: '多次',
        sequence: (lastIdx) => {
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }, getXueMeiXiang(attr)]
    }

    this.e = (startIdx) => {

      const start = startIdx; //取第一个
      const attr = {
        cd: 160,
        last: 4,
        during: 92, //90 => 92 给q一个锁面板的时间
      };

      // 1.攻击轴    --只做e轴 --ok
      // 2.重击雪梅香 --ok
      // 3.攻击力(顺位20) --ok
      // 4.结束后队友暴击率 --ok
      // 5.附魔火    --az火伤 --ok

      return [{
        name: 'huTao_skill_E',
        main: true, //主序的、唯一的、必须存在的
        last: attr.last,
        type: '持续',//during duringEnd
        lasting: (idxNew)=>{
          return idxNew - start === attr.last - 1
        },
        duringStart: (idxNew)=>{
          let attackAdd = this.refineAttr.life * talentDamage.huTao.e[skills[1]-1].base;
          if(attackAdd > this.attr.attack * 4){
            attackAdd = this.attr.attack * 4;
          }
          this.super.note.push({
            type: 'message',
            message: `第${idxNew/10}秒，胡桃进入彼岸蝶舞状态，攻击提升${Math.round(attackAdd)}。`,
          });
          //魔女套叠层 -- todo 挪出去!
          this.eventTrigger.filter(res => res.bindAction === 'E').forEach(res => {
            res.reward();
          });
          //攻击加成
          this.attackRefine = {
            name: 'huTao_skillE_benefit',
            value: attackAdd,
            type: 'number'
          };
          //队友切换立即结束
          this.super.teamSwitchEndFuncArr.push(()=>{
            this.attackRefine = {
              name: 'huTao_skillE_benefit',
              value: 0,
              type: 'number'
            };
          });
        },
        during: (idxNew)=>{
          return {flag: idxNew - start === attr.during + attr.last}; //last结束后触发duringEnd
        },
        duringEnd: (idxNew)=>{
          this.super.note.push({
            type: 'message',
            message: `第${idxNew/10}秒，胡桃彼岸蝶舞状态结束，攻击恢复。`,
          });
          this.attackRefine = {
            name: 'huTao_skillE_benefit',
            value: 0,
            type: 'number'
          };
          return true;
        }
      }]
    }

    this.q = (startIdx) => {

      //锁面板

      const start = startIdx; //取第一个
      const attr = {
        cd: 150,
        last: 17,
      };

      //todo 施加雪梅香

      //1.不考虑回血
      //2.算高位倍率
      const effect = [{
        from: name,
        name: 'q',
        elementAmount: 60,   //能量
        sequence: 10,        //todo
        damageMultiple: talentDamage.huTao.q[skills[0]-1].base,
        damageType: 'Q',
        damageBase: [{base: 'attack', rate: 1, from: name, main: true}],
        attach: {
          element: [0,1,0,0,0,0,0,0],
          type: 'B',
          time: 120,
        },
        lockedAttr: null,
        message: '第/time/秒，胡桃使用安神秘法(面板锁定)，造成/damage/点伤害。',
      }];

      return [{
        name: 'huTao_skill_Q',
        main: true, //主序的、唯一的、必须存在的
        last: attr.last,
        lasting: (lastIdx)=>{
          return lastIdx - start === attr.last - 1
        },
        type: '单次',
        sequence: (lastIdx) => {
          if(!effect[0].lockedAttr){
            effect[0].lockedAttr = _.cloneDeep(this.super[name].refineAttr);
          }
          return effect.filter(res => lastIdx - start === res.sequence)
        },
      }]
    }
  };

  return {
    basic,
    talent,
    teamTalent,
    action
  }
}