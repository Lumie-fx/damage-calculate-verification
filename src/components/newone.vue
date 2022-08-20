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
import * as roles from '../config/roles/index'
import weapons from '../config/weapons'
import relicSuit from '../config/relicSuit'
import {chargeElementSequence} from '../config/elementCharge'
import {damageCount} from '../config/damageCount'

import relics from '../config/relics' //模拟当前圣遗物属性
import utils from "../config/utils";

//todo large 等级规整 role中按不同等级规整属性和突破属性(每10级)
//数据 todo 接入miao-plugin查询插件数据 - enka

const insert = [{
  name: 'shenLiLingHua',
  element: '冰',
  weapon: {
    name: 'wuQieZhiHuiGuang',
    level: 90,
    stars: 5,
  },
  level: 90,
  stars: 6,
  skill: [10,13,13],
  wear: [{name: 'bingFeng', num: 4}],
  relics: {
    life: 5348,
    lifePercent: 0,
    attack: 342,
    attackPercent: .95,
    defend: 77,
    defendPercent: .066,
    critical: .443,
    criticalDamage: 1.174,
    energyCharge: .052,
    elementMaster: 23,
    elementCharge: [0,0,.466,0,0,0,0,0],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
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
  wear: [{name: 'jueYuan', num: 4}],
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
},{
  name: 'zhongLi',
  element: '岩',
  weapon: {
    name: 'huMoZhiZhang',
    level: 90,
    stars: 2,
  },
  level: 90,
  stars: 2,
  skill: [9,9,10],
  wear: [{name: 'jueDouShi', num: 2},{name: 'qianYan', num: 2}],
  relics: {
    life: 5766,
    lifePercent: 1.125,
    attack: 311,
    attackPercent: .163,
    defend: 0,
    defendPercent: .117,
    critical: .595,
    criticalDamage: .645,
    energyCharge: .065,
    elementMaster: 19,
    elementCharge: [0,0,0,0,0,.466,0,0],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
  },
},{
  name: 'aBeiDuo',
  element: '岩',
  weapon: {
    name: 'chenShaZhiFangChui',
    level: 90,
    stars: 5,
  },
  level: 90,
  stars: 0,
  skill: [1,9,6],
  wear: [{name: 'huaGuan', num: 2}],
  relics: {
    life: 5228,
    lifePercent: .105,
    attack: 344,
    attackPercent: .041,
    defend: 35,
    defendPercent: .788,
    critical: .614,
    criticalDamage: .909,
    energyCharge: .091,
    elementMaster: 91,
    elementCharge: [0,0,0,0,0,.466,0,0],//增伤, 初始一倍, 顺序:水火冰雷风岩草物
  },
}];

const insertRoles = insert.map(res=>res.name);

const log = console.log

export default {
  name: 'newone',
  mounted(){


    //碎冰反应未考虑
    //莫娜星异受冻结影响时间延长未考虑

    let teamElement = new Set();
    insert.forEach(res=>{
      teamElement.add(res.element);
    });

    const weaponNameList = ['剑','大剑','枪','弓','书'];
    const actionNameList = ['A','Z','D','E','Q'];// ...还有其他
    const elementNameList = ['水','火','冰','雷','风','岩','草','物'];

    const pack = function(name, level, role, weapon, relic, suit, _super){
      this.name = name;
      this.level = level;
      this.front = false;

      this.teamElementNum = teamElement.size;
      this.super = _super;
      this.weaponType = role.basic.weaponType;//武器类型

      this.attr = {
        ...role.basic,
        attack: role.basic.attack + weapon.basic.attack
      };

      this.refineAttr = {
        //生命
        lifeArr: [{name: 'life_base', value: this.attr.life, type: 'number'}],
        life: 0,
        //攻击
        attackArr: [{name: 'attack_base', value: this.attr.attack, type: 'number'}],
        attack: 0,
        //防御
        defendArr: [{name: 'defend_base', value: this.attr.defend, type: 'number'}],
        defend: 0,
        //暴击
        criticalArr: [{name: 'critical_base', value: this.attr.critical, type: 'number'}],
        critical: 0,
        //爆伤
        criticalDamageArr: [{name: 'criticalDamage_base', value: this.attr.criticalDamage, type: 'number'}],
        criticalDamage: 0,
        //充能
        energyChargeArr: [{name: 'energyCharge_base', value: this.attr.energyCharge, type: 'number'}],
        energyCharge: 0,
        //精通
        elementMasterArr: [{name: 'elementMaster_base', value: this.attr.elementMaster, type: 'number'}],
        elementMaster: 0,
        //增伤&元素类型
        elementChargeArr: [{name: 'elementCharge_base', value: this.attr.elementCharge, type: 'number'}],
        elementCharge: [0,0,0,0,0,0,0,0],   //[水火冰雷风岩草物]
        elementType: this.attr.elementType, //[水火冰雷风岩草物]
        //独立额外减防
        defendMitigationArr: [],//角色独立减防区 如雷神2命
        defendMitigation: 0,
        //个人额外反应加成
        //只存, 中间不计算, 最后计算按内部规则实现, 如: 元素精通系数区间魔女套/莫娜1命
        elementReactionAloneArr: [],
        //其他增伤区间 [普攻,重击,下落攻击,元素战技,元素爆发,单手剑角色等,法器角色等]
        //有属性依赖的放refine中进行transfer, 见$002, 没属性依赖的直接push, 格式需与$002一致
        increaseAddOn: [],
        //todo 还有一些不能锁入面板的加成 区分
      };

      //动作触发类, 时序相关:    绑定动作            触发事件   当前层     最大叠层    满层事件           一层持续/叠层时间是否拆分    结束事件
      //        {name: 'id',bindAction: 'a/e/q', reward(), now: 1, max: 1/2/3, maxReward(), duration: 100/[100,100,100], durationEnd()}
      this.eventTrigger = [];

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
        },
        //单项提升
        increaseAddOnRefine: {
          set: (obj) => {
            // obj = {
            //   name: 'relic_jueYuan_4',
            //   effect: {
            //     effectAction: [0,0,0,0,1],        //生效伤害类型[A,Z,D,E,Q, ...]
            //     effectWeaponType: [1,1,1,1,1],    //生效武器类型 [剑,大剑,枪,弓,书]
            //     effectArea: 'elementCharge',      //生效乘区, 多个多次赋值(如小鹿6命)
            //     effectElement: [1,1,1,1,1,1,1,1], //生效属性, 额外算作系数使用=>如匣里灭辰 [1,1,0,0,0,0,0,0] (当然这里不算, 灭辰需要打水/火元素影响的人才有增伤)
            //     attachedBy: [0,0,0,0,0,0,0,0],    //附着需求
            //     effectValue: .5,
            //   },
            //   timeCount: res.timeCount,           //置入计时 todo
            // };

            if(_.find(this.refineAttr.increaseAddOn, {name: obj.name})){
              this.refineAttr.increaseAddOn[_.findIndex(this.refineAttr.increaseAddOn, {name: obj.name})] = obj;
            }else{
              this.refineAttr.increaseAddOn.push(obj);
            }
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
                if(utils.queryValueType(res.to) === 'String'){
                  let transferValue = this.refineAttr[res.from] * res.value;

                  //有最大值限制
                  // if(res.max){
                  //   const based = res.max.base ? 'attr' : 'refineAttr';
                  //   if(transferValue > this[based] * res.max.amount){
                  //     transferValue = this[based] * res.max.amount;
                  //   }
                  //   log(based,this[based],res.max.amount,transferValue)
                  // }

                  //如护摩:life=>attack, 这里就增加attackRefine的监听
                  //                         imp:2个name保持一致      值             类型应该只有数字
                  this[res.to + 'Refine'] = {name: res.name, value: transferValue, type: 'number'};
                }else if(utils.queryValueType(res.to) === 'Object'){
                  //定为特殊(特定)转化
                  let value = this.refineAttr[res.from] * res.value;
                  if(res.max){
                    if(res.max.from){
                      //todo 有from判断max.base和max.from 对应$002
                      //如类似胡桃E加成是收基础攻击影响
                      //暂时还没有遇到
                    }else{
                      if(value > res.max.amount) value = res.max.amount;
                    }
                  }
                  this.increaseAddOnRefine = {
                    name: res.name,
                    effect: {
                      effectAction: res.to.effectAction,
                      effectWeaponType: res.to.effectWeaponType,
                      effectArea: res.to.effectArea,
                      effectElement: res.to.effectElement,
                      attachedBy: res.to.attachedBy,
                      attachedType: res.to.attachedType,
                      effectValue: value,
                    },
                    timeCount: res.timeCount
                  };
                }
              });
            }
          }
        }
      });

      Object.defineProperties(this, {...defined});

      //圣遗物绑定
      relics.init.bind(this)(relic);
      //圣遗物套装
      suit.forEach(res => {
        relicSuit[res.name].bind(this)(res.num);
      });
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
          roll.wear,
          this
        );
      });

      this.attackBindArr = [];//普攻绑定触发 行秋/夜兰/托马

      insertRoles.forEach(res=>{
        this[res] = _.find(this.team, {name: res});
      })


      this.doubleGeoResonateFlag = false;//是否开启双岩共鸣开关
      this.doubleCryoResonateFlag = false;//是否开启双冰共鸣开关
      this.shieldArr = [];            //护盾{type:'火',name: 'zhongLi_E',time:100},..

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

      //组队buff
      if(this.team.length === 4){
        //双岩共鸣
        if(insert.filter(teamMember => teamMember.element === '岩').length >= 2){
          this.doubleGeoResonateFlag = true;
        }
        //双火共鸣
        if(insert.filter(teamMember => teamMember.element === '火').length >= 2){
          this.teamRefine('all', 'team_2_pyro_attack_25%', {
            name: 'attack',
            value: {name: 'team_2_pyro_attack_25%', value: .25, type: 'percent'}
          });
        }
        //双冰共鸣
        if(insert.filter(teamMember => teamMember.element === '冰').length >= 2){
          this.doubleCryoResonateFlag = true;
        }
        //todo 双水共鸣 hydro
        //雷 electro
        //草 dendro
        //风 anemo
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

      this.elementPoolMonster = [];//怪物元素池
      this.elementPoolMine = [];   //角色元素池

      this.geoItems = 0;           //当前岩造物数量
      this.beResonatedItems = 0;   //被共鸣物体数量

      this.attackAttachArr = [];   //附魔种类 {name: 'shenLi/all', element: []}

      this.reactionFreeze = {      //冻结反应基本参数
        base: .04,
        now: .04,
        decrease: .02,
        increase: .01,
        increaseTimes: 0,
        decreaseTimes: 0,
        changeFun(arr, idx){
          const freeze = _.find(arr, {name: 'element_reaction_freeze'});
          // log('冻元素',idx,freeze.amount)
          if(freeze.amount > 0){
            freeze.amount = freeze.amount >= this.now ? freeze.amount - this.now : 0;
            this.increaseTimes ++;
            if(this.increaseTimes >= 10){
              this.now += this.increase;
              this.increaseTimes = 0;
            }
            this.decreaseTimes = 0;
          }else{
            this.decreaseTimes ++;
            if(this.decreaseTimes >= 10){
              this.now = this.now - this.decrease >= this.base ? this.now - this.decrease : this.base;
              this.decreaseTimes = 0;
            }
            this.increaseTimes = 0;
          }
        },
      };
      this.elementReactionItemsArr = [{ //元素反应产物 - 冻、草核、激化
        name:'element_reaction_freeze',
        funcName: 'reactionFreeze',
        amount: 0, // >0 表示被冻结
      }];

      //记录怪物减益buff + 护盾 + 角色附魔
      const teamDefined = {
        //元素反应产物
        elementReactionItemsRefine: {
          set: obj => {    // {name: 'element_reaction_freeze', role: 'shenLiLingHua', type: 'person(个人生效)/all(所有人生效:班尼特q重云e)', element: [], time: 50}
            const arr = this.elementReactionItemsArr;
            if(_.find(arr, {name: obj.name})){
              const idx = _.findIndex(arr, {name: obj.name});
              arr[idx].amount += obj.amount;
            }
          }
        },
        //附魔种类
        attackAttachRefine: {
          set: obj => {    // {name: 'shenLi_s_5s', role: 'shenLiLingHua', type: 'person(个人生效)/all(所有人生效:班尼特q重云e)', element: [], time: 50}
            // log(_.cloneDeep(this.attackAttachArr))
            const arr = this.attackAttachArr;
            if(_.find(arr, {name: obj.name})){
              const idx = _.findIndex(arr, {name: obj.name});
              arr[idx].time = obj.time;
            }else{
              arr.push(obj);
            }
          }
        },
        //护盾种类
        shieldRefine: {    //{type:'火',name: 'zhongLi_E',time:100}
          set: obj => {
            const arr = this.shieldArr;
            if(_.find(arr, {name: obj.name})){
              const idx = _.findIndex(arr, {name: obj.name});
              arr[idx].time = obj.time;
            }else{
              arr.push(obj);
              if(arr.length === 1){
                //开始有护盾事件
                //双岩共鸣
                if(this.doubleGeoResonateFlag){
                  this.resistanceMitigationRefine = {
                    name: 'team_2_geo_with_shield_resistance',
                    value: [0,0,0,0,0,.2,0,0],
                    type: 'number',
                  };
                  this.teamRefine('all', 'team_2_geo_with_shield_increase', {
                    name: 'elementCharge',
                    value: {name: 'team_2_geo_with_shield_increase', value: new Array(8).fill(.15), type: 'number'}
                  });
                }
              }
            }
          }
        },
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
          set: obj => { //obj: {name: 'huTao_skillE_benefit', value: .3}  -- , type: 'percent/number' 暂时都是百分比
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
    // xiao:e6-q-d11-e6    yeLan:q-a-e2|
    // const chain = 'aBeiDuo:e|zhongLi:q|yeLan:q-a-e2|huTao:e-az9-a-q';
    const chain = 'shenLiLingHua:s-a-e3-a-e3';

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

    let packActionsFlag = true;

    const cdObj = {};
    let cdList = [];

    for(let i = 0; i < wholeTime; i++){

      const thisActionName = _actions[pointer]?.name; // -az-
      const thisActionArr = _actions[pointer]?.action; // func az

      if(thisActionArr === 'switch'){
        pointer++;
        //切换人物事件
        teamPack.teamSwitch(thisActionName);
        continue;
      }

      //元素剩余
      // log(i,teamPack.elementPoolMonster?.[0]?.amount,teamPack.elementPoolMonster?.[0]?.sequence?.attach?.element)

      if(!thisActionArr){
        break; //所有招式结束
      }

      if(!packActions){ //触发 返回arr了
        packActions = thisActionArr(i);  //sequence []  --一个last内pack的多个子action值
      }

      //一个动作只执行一次 - todo 测试
      if(packActionsFlag){
        // log(i, thisActionArr)
        //存cd>0的动作名称和cd
        const actMain = packActions.filter(res => res.main)?.[0];
        if(cdObj[actMain.name] > 0 && !cdList.includes(actMain.name)){//第二次
          cdList.push(actMain.name);
          log(i, '第二次', _.cloneDeep(cdList))
        }
        if(actMain.cd > 0 && !cdList.includes(actMain.name)){ //第一次
          cdObj[actMain.name] = actMain.cd;
          log(i, '第一次', _.cloneDeep(cdObj))
        }
        //todo 问题出在这，第二次的时候已经执行了，没法跳出

        // log(i , packActions.filter(res=>res.main)[0].cd)

        packActions.forEach(packAction => {
          if(packAction.type === '持续'){
            // if(!_.find(actionList, {name: packAction.name})){
              packAction.duringStart(i);//生效 $001
              actionList.push(packAction);//当前执行中
            // }
          }
          //写的有问题。。 todo
          if(packAction.type === '持续可覆盖'){
            // if(!_.find(actionList, {name: packAction.name})){
              packAction.duringStart(i);
              actionList.push(packAction);//当前执行中
            // }else{
              // _.find(actionList, {name: packAction.name})?.duringStart(i);
            // }
          }
          if(packAction.type === '延迟伤害'){//具体分析  -- 延迟伤害就这2个, 是否统一循环处理
            // if(packAction.name === 'huTao_skill_E_xueMeiXiang'){
              if(!_.find(actionList, {name: packAction.name})){ //只存在单个需要这个判断
                packAction.duringStart(i);//生效  =>  传入i在内部计算
                actionList.push(packAction);//当前执行中
              }
            // }
            //1.胡桃雪梅香 huTao_skill_E_xueMeiXiang
            //2.钟离共鸣 zhongLi_skill_E_gongMing
            //3.绫华霜灭 shenLiLingHua_skill_Q_shuangMie
          }
        });
      }
      packActionsFlag = false;

      //持续型buff增益结束时的清除缓存
      const clearList = [];
      //结束执行
      actionList.forEach((fnObj,index) => {
        const duringStatus = fnObj?.during(i);
        //满足触发条件
        if(duringStatus?.flag){
          //存在触发队列
          if(duringStatus?.sequence){
            const _sequence = duringStatus.sequence;
            const _sequenceArr = utils.queryValueType(_sequence) === 'Array' ? _sequence : [_sequence];
            //                                      此为1.胡桃雪梅香的延时触发sequence
            chargeElementSequence.bind(teamPack)(i, _sequenceArr);
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

        // if(packAction.type === '持续'){
        //
        // }


        //这里有点奇怪 -- todo 重新验证下
        if(packAction.type === '延迟伤害'){
          //胡桃的特殊触发, 重击延长雪梅香时间
          if(packAction.name === 'huTao_skill_E_xueMeiXiang'){
            _.find(actionList, {name: packAction.name}).refresh(i);
          }
        }
      });


      // log(i, huTao.refineAttr.attack ,packActions.name);//下一个
      // log(i, JSON.parse(JSON.stringify(teamPack.huTao.refineAttr)))

      //触发类事件的持续和结束
      teamPack.team.forEach(role => {
        role.eventTrigger.forEach(timingEvent => {
          //类似魔女套叠层触发效果
          if(timingEvent.type === '1'){
            //todo duration = number or array 分别叠层的情况:冬极白星
            if(timingEvent?.duration > 0){
              // log('<<<<<<<<<<<<<<<<<<<')
              // log(i, timingEvent?.duration)
              timingEvent.duration --;
            }
            if(timingEvent?.duration === 0){
              timingEvent.duration = -1;//避免===0重复触发
              timingEvent.durationEnd();
            }
          }
          // - 类似辰砂之纺锤的处理 、绫华6命 $003
          if(timingEvent.type === '2'){
            if(timingEvent?.duration > 0 && timingEvent.open){
              timingEvent.duration --;
            }
            if(timingEvent?.cd > 0 && timingEvent.isCd){
              timingEvent.cd --;
            }
            if(timingEvent?.duration === 0 && timingEvent.open){
              log(i, 'durationEnd',timingEvent.name)
              timingEvent.durationEnd();
            }
            if(timingEvent?.cd === 0 && timingEvent.isCd){
              timingEvent.cdEnd();
            }
          }
        })
      });


      // log(i, JSON.parse(JSON.stringify(teamPack?.xiao.refineAttr)))

      //护盾时序
      const delShieldIdx = [];
      teamPack.shieldArr.forEach((shield, s_idx) => {
        if(shield?.time || shield.time === 0){
          shield.time --;
          if(shield.time <= 0){
            delShieldIdx.push(s_idx);
          }
        }
      });
      if(delShieldIdx.length > 0){
        delShieldIdx.reverse().forEach(d_idx => {
          teamPack.shieldArr.splice(d_idx, 1);
        });
        if(teamPack.shieldArr.length === 0){
          //全部护盾都消失事件
          teamPack.resistanceMitigationRefine = {
            name: 'team_2_geo_with_shield_resistance',
            value: new Array(8).fill(0),
            type: 'number',
          };
          teamPack.teamRefine('all', 'team_2_geo_with_shield_increase', {
            name: 'elementCharge',
            value: {name: 'team_2_geo_with_shield_increase', value: new Array(8).fill(0), type: 'number'}
          });
        }
      }

      //附魔时序
      const delAttackAttachIdx = [];
      teamPack.attackAttachArr.forEach((attach, a_idx) => {
        if(attach?.time || attach.time === 0){
          attach.time --;
          if(attach.time <= 0){
            attach?.end(i);//附魔结束事件
            delAttackAttachIdx.push(a_idx);
          }
        }
      });
      if(delAttackAttachIdx.length > 0){
        delAttackAttachIdx.reverse().forEach(d_idx => {
          teamPack.attackAttachArr.splice(d_idx, 1);
        });
      }

      //元素反应生成物时序
      teamPack.elementReactionItemsArr.forEach(res => {
        teamPack[res.funcName].changeFun(teamPack.elementReactionItemsArr, i)
      });





      //冷却没结束直接等待
      //todo 2个问题
      // 1.技能时长存了以后, 第一次仍然要到cd结束才走的到下个pointer
      // 2.cd>last时, packAction?.lasting不触发了, 是否packAction?.lasting改为>=  - 绫华eq改了, 貌似ok

      //cd过去1, 读秒
      // actionCdGoTime1();
      //
      // const action2Name = packActions.filter(res => res.main)?.[0].name;
      // log(i, nextActionName)
      // if(nextActionName.includes(action2Name)){
      //   // if(action2Name === 1) debugger
      //   // log(i, nextActionName)
      //   continue;
      // }
      const cdDelList = [];
      for(let cdName in cdObj){
        cdObj[cdName]--
        if(cdObj[cdName] === 0){
          cdDelList.push(cdName);
        }
      }
      cdList = cdList.filter(_name => !cdDelList.includes(_name));

      const action2Name = packActions.filter(res => res.main)?.[0].name;

      log(i,_.cloneDeep(cdList), action2Name)

      if(cdList.includes(action2Name)){
        continue;
      }

      packActions.forEach(packAction => {
        //当前动作主序时长结束, 指针+1, 读取下一动作
        if(packAction?.main && packAction?.lasting(i)){
          packActions = null;
          pointer++;
          packActionsFlag = true;
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
