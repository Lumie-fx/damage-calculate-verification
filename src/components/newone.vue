<template>
  <div class="module" style="height: 100%">
    <div class="btn">A</div>
    <div class="btn">E</div>
    <div class="btn">Q</div>
    <div class="btn">dash</div>
    <div class="btn">jump</div>
  </div>
</template>

<script>

import _ from 'lodash'
import enumerate from '../config/enumerate'
import * as roles from '../config/roles/index'
import weapons from '../config/weapons'
import sywSuit from '../config/sywSuit'
import {chargeElementSequence} from '../config/elementCharge'
import {damageCount} from '../config/damageCount'

import relics from '../config/relics' //模拟当前圣遗物属性



//数据 todo 接入miao-plugin查询插件数据

const insert = [{
  name: 'huTao',
  element: '火',
  weapon: {
    name: 'huMoZhiZhang',
    level: 90,
    stars: 5,
  },
  level: 90,
  stars: 6,
  skill: [10,13,13],
  wear: [{moNv: 4}],
  relics: {
    life: 5766,
    lifePercent: .327,
    attack: 311,
    attackPercent: .116,
    defend: 37,
    defendPercent: 0,
    critical: .7,
    criticalDamage: .731,
    energyCharge: .058,
    elementMaster: 261,
    elementCharge: [0,.466,0,0,0,0,0,0],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
  },
},{
  name: 'yeLan',
  element: '水',
  weapon: {
    name: 'ruoShui',
    level: 90,
    stars: 1,
  },
  level: 90,
  stars: 4,
  skill: [8,9,12],
  wear: [{jueYuan: 4}],
  relics: {
    life: 4780,
    lifePercent: .804,
    attack: 329,
    attackPercent: 0,
    defend: 0,
    defendPercent: .139,
    critical: .455,
    criticalDamage: .894,
    energyCharge: .745,
    elementMaster: 42,
    elementCharge: [.466,0,0,0,0,0,0,0],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
  },
}];

const insertRoles = insert.map(res=>res.name);

const log = console.log

export default {
  name: 'newone',
  mounted(){


    //碎冰反应未考虑
    //莫娜星异受冻结影响时间延长未考虑
    //todo 圣遗物套装

    let teamElement = new Set();
    insert.forEach(res=>{
      teamElement.add(res.element);
    })

    const pack = function(name, level, role, weapon, relic, _super){
      this.name = name;
      this.level = level;
      this.front = false;

      this.teamElementNum = teamElement.size;
      this.super = _super;

      this.attr = {
        ...role.basic,
        attack: role.basic.attack + weapon.basic.attack
      };

      this.refineAttr = {
        //name: baseLife | lifeRelic lifePercentRelic | lifeWeapon lifeWeaponPassive
        lifeArr: [{name: 'life_base', value: this.attr.life, type: 'number'}],
        life: 0,
        //name: baseAttack | attackRelic attackPercentRelic | attackWeapon attackWeaponPassive
        attackArr: [{name: 'attack_base', value: this.attr.attack, type: 'number'}],
        attack: 0,
        //name: baseDefend | defendRelic defendPercentRelic
        defendArr: [{name: 'defend_base', value: this.attr.defend, type: 'number'}],
        defend: 0,
        //name: baseCritical | criticalRelic
        criticalArr: [{name: 'critical_base', value: this.attr.critical, type: 'number'}],
        critical: 0,
        //name: baseCriticalDamage | criticalDamageRelic criticalDamageWeapon
        criticalDamageArr: [{name: 'criticalDamage_base', value: this.attr.criticalDamage, type: 'number'}],
        criticalDamage: 0,
        //name: baseEnergyCharge | energyChargeRelic
        energyChargeArr: [{name: 'energyCharge_base', value: this.attr.energyCharge, type: 'number'}],
        energyCharge: 0,
        //name: baseElementMaster | elementMasterRelic
        elementMasterArr: [{name: 'elementMaster_base', value: this.attr.elementMaster, type: 'number'}],
        elementMaster: 0,
        //元素精通系数区间魔女套/莫娜1命 todo  超载/超导/燃烧/...
        elementReactionTimesArr: [],
        elementReactionTimes: 0,
        //name: baseElementCharge | elementChargeRelic
        elementChargeArr: [{name: 'elementCharge_base', value: this.attr.elementCharge, type: 'number'}],
        elementCharge: [0,0,0,0,0,0,0,0],   //[水火冰雷风岩草物]
        elementType: this.attr.elementType, //[水火冰雷风岩草物]
        //todo 其他增伤区间 [普攻,重击,下落攻击,元素战技,元素爆发,单手剑角色等,法器角色等]
        //todo 这边的话想用枚举的统一增伤数组, 根据首位区分
        //todo 还有一些不能锁入面板的加成 区分
        defendMitigationArr: [],//角色独立减防区 如雷神2命
        defendMitigation: 0,
      };

      const defined = {
        elementChargeRefine: {
          set: obj => { //obj: {name: '', value: 5.8, type: 'percent/number'}
            const arr = this.refineAttr.elementChargeArr;
            if(_.find(arr, {name: obj.name})){
              const idx = _.findIndex(arr, {name: obj.name});
              arr[idx] = {...obj};
            }else{
              arr.push(obj);
            }
            //计算
            this.refineAttr.elementCharge = arr.reduce((sum, now)=>{
              now.value.forEach((itm,idx)=>{
                sum[idx] += itm;
              })
              return sum;
            }, [0,0,0,0,0,0,0,0]);
          }
        }
      };

      /**
        所有refine:
         @lifeRefine
         @attackRefine
         @defendRefine
         @criticalRefine
         @criticalDamageRefine
         @energyChargeRefine
         @elementMasterRefine
         @elementReactionTimesRefine
         @defendMitigationRefine
       */
      ['life','attack','defend','critical','criticalDamage','energyCharge','elementMaster','defendMitigation'].forEach(item => {
        defined[item+'Refine'] = {
          set: obj => { //obj: {name: 'huTao_skillE_benefit', value: 2000, type: 'percent/number'}
            const arr = this.refineAttr[item+'Arr'];
            if(_.find(arr, {name: obj.name})){
              const idx = _.findIndex(arr, {name: obj.name});
              arr[idx].value = obj.value;
            }else{
              arr.push(obj);
            }
            //计算
            this.refineAttr[item] = arr.reduce((sum, now)=>{
              if(now.type === 'number') sum += now.value;
              if(now.type === 'percent') sum += this.attr[item] * now.value;
              return Math.round(sum*1000)/1000;
            }, 0);

            //todo 后续应该会有flag禁止多个转化互相触发(砂糖)
            //from-to转化的场景
            const transfer = arr.filter(res => res.type === 'transfer');
            if(transfer.length > 0){
              transfer.forEach(res => {
                //如护摩:life=>attack, 这里就增加attackRefine的监听
                //                         imp:2个name保持一致      值                                     类型应该只有数字
                this[res.to + 'Refine'] = {name: res.name, value: this.refineAttr[res.from] * res.value, type: 'number'};
              });
            }
          }
        }
      });

      Object.defineProperties(this, {...defined});

      //圣遗物绑定
      relics.init.bind(this)(relic);
      //武器绑定
      weapon.refine.bind(this)();
      //talent绑定
      role.talent?.bind(this)();
      //action绑定
      role.action.bind(this)();
      //角色对队伍的被动加成, team最后绑定, 时序90 --如胡桃给队友加暴击(放入被动计算)
      this.teamTalentInit = role.teamTalent?.bind(this);
    }

    const getTeam = function(){
      this.team = insert.map(roll=>{
        const name = roll.name;
        const weapon = roll.weapon;
        return new pack(
          name,
          roll.level,
          roles[name](roll.level, roll.stars, roll.skill),
          weapons[weapon.name](weapon.level, weapon.stars, name),
          roll.relics,
          this
        );
      });

      this.attackBindArr = [];//普攻绑定触发 行秋/夜兰/托马

      insertRoles.forEach(res=>{
        this[res] = _.find(this.team, {name: res});
      })

      if(this.team.length === 4){
        //todo 组队buff
      }

      this.teamSwitchEndFuncArr = [];

      this.teamSwitch = (name) => {//huTao, yeLan, ...

        const lastFrontRole = this.team.filter(res=>!!res.front)?.[0];

        log(`切换角色: ${name}`)
        this.team.map(res=>{
          res.front = res.name === name;
        });

        //1.前台buff转移
        this.team.forEach(_role => {
          for(let refineKey in _role.refineAttr){
            const refineValueArr = _role.refineAttr[refineKey + ''];
            if(
              (refineKey + '').indexOf('Arr') > -1 &&
              Object.prototype.toString.call(refineValueArr) === '[object Array]' &&
              refineValueArr.length > 0 &&
              lastFrontRole
            ){
              if(_.find(refineValueArr, {front: true})){
                // const transferArr = refineValueArr.splice(_.findIndex(refineValueArr, {front: true}), 1);
                refineValueArr.filter(item => !!item.front).forEach(item => { //需要转移的每个item
                  const transferName = (refineKey + '').replace('Arr','Refine');
                  //  huTao.attackRefine   = {}
                  this[name][transferName] = item; //buff转移
                  // log(item, lastFrontRole.refineAttr,transferName)
                  //buff转移的时候, 前一个人的buff需要refine为0, 不然清不掉
                  lastFrontRole[transferName] = {  //原角色buff清空, front也清除
                    name: item.name,
                    type: item.type,
                    value: typeof item.value === 'number' ? 0 : new Array(8).fill(0),
                  };
                });
              }
            }
          }
        });

        //2.部分持续技能强制结束 => 需要在技能中定义 例:搜teamSwitchEndFuncArr
        this.teamSwitchEndFuncArr.forEach(func => {
          func();
        })

      }


      //出伤对象基础配置, 最后计算伤害时使用 -可提出去
      this.monsterLevel = 90; //等级
      this.defendMitigationBase = 500; //防御 -暂时都是百分比减防, 防御公示待定
      this.resistanceMitigationBase = new Array(8).fill(.1);//抗性

      //怪物防御乘区 -- team处绑定
      this.defendMitigationArr = [];   //{name: 'shenLiLingHua_skillQ_star4', value: .3, type: 'percent'}
      this.defendMitigation = 0;     // -最后计算
      //怪物抗性乘区 -- team处绑定
      this.resistanceMitigationArr = []; //{name: 'zhongLi_skillE_long', value: [-.2,-.2,-.2-.2-.2-.2-.2-.2], type: 'number'}
      this.resistanceMitigation = [0,0,0,0,0,0,0,0];    // -最后计算

      //记录怪物减益buff todo 测试
      const teamDefined = {
        resistanceMitigationRefine: {
          set: obj => { //obj: {name: '', value: 5.8, type: 'percent/number'}
            const arr = this.resistanceMitigationArr;
            if(_.find(arr, {name: obj.name})){
              const idx = _.findIndex(arr, {name: obj.name});
              arr[idx] = {...obj};
            }else{
              arr.push(obj);
            }
            //计算
            this.resistanceMitigation = arr.reduce((sum, now)=>{
              now.value.forEach((itm,idx)=>{
                sum[idx] += itm;
              })
              return sum;
            }, [0,0,0,0,0,0,0,0]);
          }
        },
        defendMitigationRefine: {
          set: obj => { //obj: {name: 'huTao_skillE_benefit', value: 2000, type: 'percent/number'}
            const arr = this.defendMitigationArr;
            if(_.find(arr, {name: obj.name})){
              const idx = _.findIndex(arr, {name: obj.name});
              arr[idx].value = obj.value;
            }else{
              arr.push(obj);
            }
            //计算
            this.defendMitigation = arr.reduce((sum, now)=>{
              sum += now.value;
              return sum;
            }, 0);
          }
        },
      };

      Object.defineProperties(this, {...teamDefined});


      this.teamRefine = (type, name, refine) => {
        let selectRoles = null;
        if(type === 'all'){//全队
          selectRoles = this.team;
        }
        if(type === 'others'){//队友
          selectRoles = this.team.filter(res=>res.name !== name);
        }
        if(type === 'front'){//前台
          selectRoles = this.team.filter(res=>res.front === true);
        }
        if(type === 'back'){//后台
          selectRoles = this.team.filter(res=>res.front !== true);
        }
        if(selectRoles){
          selectRoles.forEach(res => {
            res[refine.name + 'Refine'] = refine.value;
          })
        }
      }

      this.note = [];

    }

    //队伍
    const teamPack = new getTeam();

    //全队/伙伴, 初始增益类buff置入面板计算, 时序90 例:胡桃加暴击平均值
    teamPack.team.forEach(res=>{
      res.teamTalentInit?.()
    });


    // teamPack.yeLan.skillE()

    log(teamPack)

    let _actions = [];

    //todo 可选
    const chain = 'yeLan:q-a-e2|huTao:e-az10-q';

    const rollChainArr = chain.split('|');

    rollChainArr.forEach(res => {
      const rollAndChain = res.split(':'); //[huTao, e-az9-q]
      const name = rollAndChain[0];
      _actions.push({
        name, //huTao
        action: 'switch',
      });
      //单人轴: e-az9-q
      rollAndChain[1].split('-').forEach(actStr=>{
        if(actStr.match(/\d+/)){
          const len = actStr.match(/\d+/)[0];
          for(let i=0;i<len;i++){
            const _key = actStr.replace(/\d/g, '');
            _actions.push({
              name: _key,
              action: teamPack[name][_key]
            });
          }
        }else{
          const _key = actStr.replace(/\d/g, '');
          _actions.push({
            name: _key,
            action: teamPack[name][_key]
          });
        }
      })
    });


    //todo while
    // const wholeTime = _actions.reduce((allValue, nowValue)=>{
    //   return person[nowValue]().filter(res=>res.main)[0].last + allValue
    // },0);

    const wholeTime = 500;

    log(`wholeTime: ${wholeTime}`);
    log(_actions)

    let pointer = 0;
    const actionList = []; //{name: ''}
    let packActions = null;

    for(let i=0; i<wholeTime;i++){

      const thisActionName = _actions[pointer]?.name; // -az-
      const thisActionArr = _actions[pointer]?.action; // func az

      if(thisActionArr === 'switch'){
        pointer++;
        //切换人物事件
        teamPack.teamSwitch(thisActionName);
        continue;
      }

      if(!thisActionArr){
        break; //所有招式结束
      }

      if(!packActions){ //触发 返回arr了
        packActions = thisActionArr(i);  //sequence []  --一个last内pack的多个子action值
      }

      // log(i, JSON.parse(JSON.stringify(teamPack.withAttackSequenceArr)))

      packActions.forEach(packAction => {
        if(packAction.type === '持续'){
          if(!_.find(actionList, {name: packAction.name})){
            packAction.duringStart(i);//生效
            actionList.push(packAction);//当前执行中
          }
        }
        if(packAction.type === '延迟伤害'){//具体分析
          //1.胡桃雪梅香
          if(packAction.name === 'huTao_skill_E_xueMeiXiang'){
            if(!_.find(actionList, {name: packAction.name})){
              packAction.duringStart(i);//生效  =>  传入i在内部计算
              actionList.push(packAction);//当前执行中
            }
          }
        }
      });

      //持续型buff增益结束时的清除缓存
      const clearList = [];
      //结束执行
      actionList.forEach((fnObj,index) => {
        const duringStatus = fnObj?.during(i);
        //满足触发条件
        if(duringStatus?.flag){
          //存在触发队列
          if(duringStatus?.sequence){
            //                                      此为1.胡桃雪梅香的延时触发sequence
            chargeElementSequence.bind(teamPack)(i, [duringStatus.sequence]);
          }
          const endFlag = fnObj.duringEnd(i);
          if(endFlag){
            clearList.push(index);
          }
        }
      });
      //清理
      clearList.reverse().forEach(indexItm=>{//去除
        actionList.splice(indexItm,1);
      });


      packActions.forEach(packAction => {
        let sequenceFlag = true;
        if(['单次','多次'].includes(packAction.type)){
          const sequenceArr = packAction?.sequence?.(i) || [];
          if(sequenceArr.length > 0){//存在执行序列
            sequenceFlag = false;
            chargeElementSequence.bind(teamPack)(i, sequenceArr);
          }
        }
        if(sequenceFlag){
          chargeElementSequence.bind(teamPack)(i, null);
        }

        if(packAction.type === '延迟伤害'){
          //胡桃的特殊触发, 重击延长雪梅香时间
          if(packAction.name === 'huTao_skill_E_xueMeiXiang'){
            _.find(actionList, {name: packAction.name}).refresh(i);
          }
        }
      });


      // log(i, huTao.refineAttr.attack ,packActions.name);//下一个


      packActions.forEach(packAction => {
        //当前动作主序时长结束, 指针+1, 读取下一动作
        if(packAction?.main && packAction?.lasting(i)){
          packActions = null;
          pointer++;
        }
      });

    }





    const notes = damageCount(teamPack.note);

    log(notes)
  }
}

</script>

<style scoped>
.module{
  display: flex;
}

.btn{
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  border: 1px solid #333;
  background-color: aliceblue;
  cursor: pointer;
}

.btn:active{
  background-color: aquamarine;
}

</style>
