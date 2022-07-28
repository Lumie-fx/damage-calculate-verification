import talentDamage from './talentDamage'

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

        //通过transfer额外增加一组监听
        this.lifeRefine = {name: 'life_passive_'+wn, value: attr.others.passiveAmount, type: 'transfer', from: 'life', to: 'attack'};

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
  }
}