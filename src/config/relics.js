export default {
  init(relic){

    // const relic = {
    //   life: 5766,
    //   lifePercent: .327,
    //   attack: 311,
    //   attackPercent: .116,
    //   defend: 37,
    //   defendPercent: 0,
    //   critical: .7,
    //   criticalDamage: .731,
    //   energyCharge: .058,
    //   elementMaster: 261,
    //   elementCharge: [0,.466,0,0,0,0,0,0],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
    // }

    const arr = ['life','attack','defend','critical','criticalDamage','energyCharge','elementMaster','elementCharge'];
    const arrPercent = ['life','attack','defend'];
    arr.forEach(item => {
      this[item+'Refine'] = {name: item+'Relic', value: relic[item], type: 'number'};
    });
    arrPercent.forEach(item => {
      this[item+'Refine'] = {name: item+'PercentRelic', value: relic[item+'Percent'], type: 'percent'};
    });
  }
}