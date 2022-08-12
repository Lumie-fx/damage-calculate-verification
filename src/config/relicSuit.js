import _ from 'lodash'
const log = console.log;

export default {

  //todo 排序

  moNv(num){// 2 4
    if(num >= 2){
      this.elementChargeRefine = {name: 'relic_moNv_2', value: [0,.15,0,0,0,0,0,0], type: 'number'};
    }
    if(num >= 4){
      const arr = [
        {name: 'relic_moNv_4', value: .15, type: '蒸发'},
        {name: 'relic_moNv_4', value: .15, type: '融化'},
        {name: 'relic_moNv_4', value: .4,  type: '超载'},
        {name: 'relic_moNv_4', value: .4,  type: '燃烧'},
      ];
      arr.forEach(res => {
        this.refineAttr.elementReactionAloneArr.push(res);
      });
      const that = this;
      //todo 持续buff技能类型, 由于计算方式问题, 第二次将不进入计算, 是否修复???
      // --newone: when $001
      this.eventTrigger.push({
        type: '1',
        name: 'relic_moNv4_elementCharge',
        bindAction: 'E',
        reward(){
          if(this.now < this.max){
            this.now ++;
          }else{
            this.now = this.max;
          }
          that.elementChargeRefine = {
            name: 'relic_moNv4_elementCharge',
            value: [0,.075*this.now,0,0,0,0,0,0],
            type: 'number'
          };
          this.duration = 100;//刷新持续时间
        },
        now: 0,
        max: 3,
        duration: 100,
        durationEnd(){
          that.elementChargeRefine = {
            name: 'relic_moNv4_elementCharge',
            value: new Array(8).fill(0),
            type: 'number'
          };
        }
      });
    }
  },
  jueYuan(num){
    if(num >= 2){
      this.energyChargeRefine = {name: 'relic_jueYuan_2', value: .2, type: 'number'};
    }
    if(num >= 4){
      this.energyChargeRefine = {
        name: 'relic_jueYuan_4',
        value: .25,
        type: 'transfer',
        from: 'energyCharge',
        to: {   //string / object
          effectAction: [0,0,0,0,1],     //生效伤害类型[A,Z,D,E,Q, ...]
          effectWeaponType: [1,1,1,1,1], //生效武器类型 [剑,大剑,枪,弓,书]
          effectArea: 'elementCharge',   //生效乘区
          effectElement: [1,1,1,1,1,1,1,1],//生效属性
          attachedBy: [0,0,0,0,0,0,0,0],   //附着需求
        },
        timeCount: 10000,//置入计时
        max: {           //$002
          // from: 'energyCharge',//最大值基于
          // base: false,         //是否基于基础(白字)属性,true=>attr,false=>refineAttr
          amount: .75,     //最多75%
        }
      };
    }
  },
  //角斗士
  jueDouShi(num){
    if(num >= 2){
      this.attackRefine = {name: 'relic_jueDouShi_2', value: .18, type: 'percent'};
    }
    //todo 4
  },
  //翠绿之影
  cuiLv(num){
    if(num >= 2){
      this.elementChargeRefine = {name: 'relic_cuiLv_2', value: [0,0,0,0,.15,0,0,0], type: 'number'};
    }
    //todo 4
  },
  qianYan(num){
    if(num >= 2){
      this.lifeRefine = {name: 'relic_qianYan_2', value: .2, type: 'percent'};
    }
    //todo 4
  },
  huaGuan(num){
    if(num >= 2){
      this.defendRefine = {name: 'relic_huaGuan_2', value: .3, type: 'percent'};
    }
    if(num >= 4){
      this.defendRefine = {name: 'relic_huaGuan_4_defend', value: .24, type: 'percent'};
      this.elementChargeRefine = {name: 'relic_huaGuan_4_element', value: [0,0,0,0,0,.24,0,0], type: 'number'};
    }
  }
}