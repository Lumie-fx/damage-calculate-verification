
const log = console.log;

export default {

  //护摩之杖
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

  //若水
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

  //和璞鸢
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

  //雾切之回光
  wuQieZhiHuiGuang(level, stars){//lv90  1,2,3,4,5

    const wn = 'wuQieZhiHuiGuang';

    const attr = {
      basic: {//基础属性 白字
        attack: 674
      },
      others: {//其他属性, 二次相加
        criticalDamage: .441,
        elementCharge: [
          new Array(8).fill(.12),
          new Array(8).fill(.15),
          new Array(8).fill(.18),
          new Array(8).fill(.21),
          new Array(8).fill(.24)
        ][stars-1],
      },
    };

    //todo 叠层 1.a触发元素伤害/10s 2.释放q/10s 3.能量不足100%
    //             1.订阅者
    const getCharge = (num) => {//num=1,2,3
      return [[.08,.16,.28],[.1,.2,.35],[.12,.24,.42],[.14,.28,.49],[.16,.32,.56]][stars-1][num-1];
    };

    return {
      ...attr,
      refine(){
        this.criticalDamageRefine = {name: 'criticalDamage_'+wn, value: attr.others.criticalDamage, type: 'number'};
        this.elementChargeRefine = {name: 'elementCharge_'+wn, value: attr.others.elementCharge, type: 'number'};
        this.elementChargeRefine = {name: 'elementCharge_'+wn+'_single', value: this.attr.elementType.map(res=>{
            return res * getCharge(3)
          }), type: 'number'};
      }
    }
  },

  //息灾
  xiZai(level, stars){//lv90  1,2,3,4,5

    const wn = 'xiZai';

    const attr = {
      basic: {//基础属性 白字
        attack: 741
      },
      others: {//其他属性, 二次相加
        attack: .165,
        elementCharge: [
          new Array(8).fill(.12),
          new Array(8).fill(.15),
          new Array(8).fill(.18),
          new Array(8).fill(.21),
          new Array(8).fill(.24)
        ][stars-1],
      },
    };

    //todo 叠层 e后6s每s+3.2~6.4,后台翻倍
    const serialAttack = .784;

    return {
      ...attr,
      refine(){
        this.attackRefine = {name: 'attack_'+wn+'_base', value: attr.others.attack, type: 'percent'};
        this.elementChargeRefine = {name: 'elementCharge_'+wn, value: attr.others.elementCharge, type: 'number'};
        this.attackRefine = {name: 'attack_'+wn+'_addon', value: serialAttack, type: 'percent'};
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
                effectArea: 'attackArea',
                effectValue: {base: 'defend', rate: [.4,.5,.6,.7,.8][stars-1], from: 'chenShaZhiFangChui'}
              },
              timeCount: 10000
            };
          },
          isCd: false,
          open: false,
          duration: 3, //实际-1
          cd: 16,      //实际-1
          durationEnd(){
            that.increaseAddOnRefine = {
              name: 'weapon_chenShaZhiFangChui_e_charge',
              effect: {
                effectAction: [0,0,0,1,0],
                effectArea: 'attackArea',
                effectValue: {base: 'defend', rate: 0, from: 'chenShaZhiFangChui'}
              },
              timeCount: 10000
            };
            this.duration = 3;//刷新持续时间
            this.open = false;
          },
          cdEnd(){
            this.cd = 16;
            this.isCd = false;
          }
        });

      }
    }
  },
}