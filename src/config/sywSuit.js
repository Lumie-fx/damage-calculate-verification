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
        name: 'relic_moNv4_elementCharge',
        bindAction: 'e',
        reward(){
          if(this.now <= this.max){
            this.now ++;
          }else{
            this.now = this.max;
          }
          log(this.now)
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

  }
}