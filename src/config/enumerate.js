((e)=>{

  //todo 枚举类型改为数组, 传入role名称为key, 计算多种独立加成, 如
  //弓藏特效, 平藏命座6, 神乐特效, 等

  const enu = {
    ALL_DIRECTION: true,//全指令
    AYAKA_ATTACK20: .2,//普通攻击、重击、下落攻击的增伤百分比
    AYAKA_ATTACK25: .25,
  };



  e.strike = {

  };


  //枚举值全局绑定
  for(let k in enu) e[k] = enu[k];

})(window)