import talentDamage from './talentDamage'

const log = console.log;

export default {

  huMoZhiZhang(level, stars){//lv90  1,2,3,4,5

    const wn = 'huMoZhiZhang';

    const attr = {
      basic: {//基础属性 白字
        attack: 608
      },
      others: {//其他属性, 二次相加
        criticalDamage: .662,
        lifePercent: [.2,.25,.3,.35,.4][stars-1],

        passiveAmount: [1.8/100,2.2/100,2.6/100,3.0/100,3.4/100][stars-1],
      },
    };

    return {
      ...attr,
      refine(){
        this.criticalDamageRefine = {name: 'criticalDamage_'+wn, value: attr.others.criticalDamage, type: 'number'};
        this.lifeRefine = {name: 'life_'+wn, value: attr.others.lifePercent, type: 'percent'};

        //通过transfer额外增加一组监听, 这里的lifeRefine: life每次变动后都会执行, 将生命转化为攻击
        this.lifeRefine = {
          name: 'life_passive_'+wn,
          value: attr.others.passiveAmount,
          type: 'transfer',
          from: 'life',
          to: 'attack',    //string / object
        };

        //经不完全测试, 此种写法无法额外处理夜兰等加生命上限的被动, 但是可以处理临时生效的buff, 如胡桃E
        // this.attackRefine = {name: 'attackWeaponPassive', value: this.refineAttr.life * attr.others.passiveAmount, type: 'number'};
      }
    }
  },

  ruoShui(level, stars){//lv90  1,2,3,4,5

    const wn = 'ruoShui';

    const attr = {
      basic: {//基础属性 白字
        attack: 542
      },
      others: {//其他属性, 二次相加
        criticalDamage: .882,
        lifePercent: [.16,.2,.24,.28,.32][stars-1],
        elementCharge: [
          new Array(8).fill(.2),
          new Array(8).fill(.25),
          new Array(8).fill(.3),
          new Array(8).fill(.35),
          new Array(8).fill(.4)
        ][stars-1],
      },
    };

    return {
      ...attr,
      refine(){
        this.criticalDamageRefine = {name: 'criticalDamage_'+wn, value: attr.others.criticalDamage, type: 'number'};
        this.lifeRefine = {name: 'life_'+wn, value: attr.others.lifePercent, type: 'percent'};
        this.elementChargeRefine = {name: 'elementCharge_'+wn, value: attr.others.elementCharge, type: 'number'};
      }
    }
  },

  hePuYuan(level, stars){//lv90  1,2,3,4,5

    const wn = 'hePuYuan';

    const attr = {
      basic: {//基础属性 白字
        attack: 674
      },
      //todo 伤害叠层
      others: {//其他属性, 二次相加
        critical: .221,
        attack: [.224,.273,.322,.371,.42][stars-1],
        elementCharge: [
          new Array(8).fill(.12),
          new Array(8).fill(.15),
          new Array(8).fill(.18),
          new Array(8).fill(.21),
          new Array(8).fill(.24)
        ][stars-1],
      },
    };

    return {
      ...attr,
      refine(){
        this.criticalRefine = {name: 'critical_'+wn, value: attr.others.critical, type: 'number'};
        this.attackRefine = {name: 'attack_'+wn, value: attr.others.attack, type: 'percent'};
        this.elementChargeRefine = {name: 'elementCharge_'+wn, value: attr.others.elementCharge, type: 'number'};
      }
    }
  },


















  //辰砂之纺锤
  chenShaZhiFangChui(level, stars, roleName){//lv90  1,2,3,4,5

    const wn = 'chenShaZhiFangChui';

    const attr = {
      basic: {//基础属性 白字
        attack: 454
      },
      others: {//其他属性, 二次相加
        defendPercent: .69,
      },
    };

    return {
      ...attr,
      refine(){
        const that = this;
        this.defendRefine = {name: 'defend_'+wn, value: attr.others.defendPercent, type: 'percent'};

        //e伤害加防御的40%/50%/60%/70%/80%, 间隔1.5s 持续0.1s
        this.eventTrigger.push({
          type: '2',
          from: roleName,
          name: 'weapon_chenShaZhiFangChui_e_charge',
          bindAction: 'E',
          reward(){
            that.increaseAddOnRefine = {
              name: 'weapon_chenShaZhiFangChui_e_charge',
              effect: {
                effectAction: [0,0,0,1,0],
                effectWeaponType: [1,1,1,1,1],
                effectArea: 'attackArea',
                effectElement: [1,1,1,1,1,1,1,1],
                attachedBy: [0,0,0,0,0,0,0,0],
                effectValue: {base: 'defend', rate: [.4,.5,.6,.7,.8][stars-1], from: 'chenShaZhiFangChui'}
              },
              timeCount: 10000
            };
          },
          open: true,
          duration: 3, //实际-1
          cd: 16,      //实际-1
          durationEnd(){
            that.increaseAddOnRefine = {
              name: 'weapon_chenShaZhiFangChui_e_charge',
              effect: {
                effectAction: [0,0,0,1,0],
                effectWeaponType: [1,1,1,1,1],
                effectArea: 'attackArea',
                effectElement: [1,1,1,1,1,1,1,1],
                attachedBy: [0,0,0,0,0,0,0,0],
                effectValue: {base: 'defend', rate: 0, from: 'chenShaZhiFangChui'}
              },
              timeCount: 10000
            };
            this.duration = 3;//刷新持续时间
          },
          cdEnd(){
            this.open = true;
            this.cd = 16;
          }
        });

      }
    }
  },
}