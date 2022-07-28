<template>
  <div class="hello">
    <button class="btn">按钮1</button>

    <div>
      <button id='red'>Red</button>
      <button id='black'>Black</button>
    </div>
    <div>Red: <span id="redTotal"></span> </div>
    <div>Black: <span id="blackTotal"></span> </div>
    <div>Total: <span id="total"></span> </div>

  </div>
</template>

<script>
import * as rxjs from 'rxjs'
import { interval, fromEvent, combineLatest } from 'rxjs';
import { take, mapTo, startWith, scan, tap, map } from 'rxjs/operators';  //! rxjs 和 rxjs/operators 都有take
import {Observable} from 'rxjs'
import _ from 'lodash'

window._ = _;

export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: '1'
    }
  },
  mounted(){
    window.rxjs = rxjs;

    /**
     Observable (可观察对象): 表示一个概念，这个概念是一个可调用的未来值或事件的集合。
     Observer (观察者): 一个回调函数的集合，它知道如何去监听由 Observable 提供的值。
     Subscription (订阅): 表示 Observable 的执行，主要用于取消 Observable 的执行。
     Operators (操作符): 采用函数式编程风格的纯函数 (pure function)，使用像 map、filter、concat、flatMap 等这样的操作符来处理集合。
     Subject (主体): 相当于 EventEmitter，并且是将值或事件多路推送给多个 Observer 的唯一方式。
     Schedulers (调度器): 用来控制并发并且是中央集权的调度员，允许我们在发生计算时进行协调，例如 setTimeout 或 requestAnimationFrame 或其他。
     */


    const button = document.querySelector('button');
    const clicks$ = rxjs.fromEvent(button, 'click');
    const document$ = rxjs.fromEvent(document, 'click');


    //imp 自定义操作符
    const selfOperator = (num) => (observable) => {
      return rxjs.Observable.create(observer => {
        let count = 0;
        return observable.subscribe({
          next(x) {
            if(count++ % num === 0) observer.next(x);
          },
          error(err) {observer.error(err);},
          complete() {observer.complete();}
        })
      });
    };

    // interval(1000).pipe(selfOperator(3), take(5)).subscribe(console.log)


    /** rxjs.combineLatest */
    // // timerOne 在1秒时发出第一个值，然后每4秒发送一次
    // const timerOne = rxjs.timer(1000, 4000);
    // // timerTwo 在2秒时发出第一个值，然后每4秒发送一次
    // const timerTwo = rxjs.timer(2000, 4000);
    // // timerThree 在3秒时发出第一个值，然后每4秒发送一次
    // const timerThree = rxjs.timer(3000, 4000);
    //
    // // 当一个 timer 发出值时，将每个 timer 的最新值作为一个数组发出
    // const combined = rxjs.combineLatest(timerOne, timerTwo, timerThree);
    //
    // const subscribe = combined.subscribe(latestValues => {
    //       // 从 timerValOne、timerValTwo 和 timerValThree 中获取最新发出的值
    //   const [timerValOne, timerValTwo, timerValThree] = latestValues;
    //   /*
    //     示例:
    //     timerOne first tick: 'Timer One Latest: 1, Timer Two Latest:0, Timer Three Latest: 0
    //     timerTwo first tick: 'Timer One Latest: 1, Timer Two Latest:1, Timer Three Latest: 0
    //     timerThree first tick: 'Timer One Latest: 1, Timer Two Latest:1, Timer Three Latest: 1
    //   */
    //   console.log(
    //       `Timer One Latest: ${timerValOne},
    //        Timer Two Latest: ${timerValTwo},
    //        Timer Three Latest: ${timerValThree}`
    //   );
    // });

    // 用来设置 HTML 的辅助函数
    const setHtml = id => val => (document.getElementById(id).innerHTML = val);

    const addOneClick$ = id =>
        fromEvent(document.getElementById(id), 'click').pipe(
          mapTo(1), // 将每次点击映射成1
          startWith(0),
          scan((acc, curr) => acc + curr), // 追踪运行中的总数
          tap(setHtml(`${id}Total`))   // 为适当的元素设置 HTML
        );

    combineLatest(addOneClick$('red'), addOneClick$('black'))
        .pipe(map(([val1, val2]) => val1 + val2))
        .subscribe(setHtml('total'));

    /** rxjs.combineLatest end */




  },
  methdos:{

    day1(){

      // const itv = rxjs.interval(500).subscribe(console.log);
      // itv.unsubscribe(); //结束订阅

      //连续pipe
      // rxjs.interval(500).pipe(rxjs.take(12)).pipe(rxjs.take(2)).subscribe(console.log)

      // rxjs.interval(500)         //Observable creation:建立运算/可观察对象
      //     .pipe(rxjs.take(2))    //Operators  take/filter:过滤运算
      //     //Subscription 回传订阅物件
      //     .subscribe(console.log)//Observer   观察者(function)

      //take/skip等, 满足条件即会触发取消订阅unsubscribe
      //? 这2个operator据说可以满足分页功能
      //! 上百种Operator的Cnn组合

      //轻量调用
      // interval(100).pipe(take(5)).subscribe(console.log)

      //rxjs.fromEvent(document, 'click').subscribe(console.log);
      let clicks$ = fromEvent(document, 'click');  //Observable
      const subs$ = clicks$.subscribe({
        next: (x)=>{ //Observer也可以是一个物件, 这样的物件有3种属性(必须是func的callback): next/error/complete
          console.log(x)
        }
      });
      // clicks$.subscribe(x => console.log(x))
      // clicks$.subscribe(console.log)
      subs$.unsubscribe(); //取消订阅, console, 但是可观察对象还是存在的

      // clicks$.pipe(rxjs.filter(x=>x.clientX<300)).subscribe(console.log) //建立新的订阅, x轴大于300会被过滤

      //! 关于pipe的顺序影响
      // clicks$.pipe(rxjs.filter(x=>x.clientX<300), take(3)).subscribe(console.log) //同时固定选取次数, 小于300才会进入take筛选
      // clicks$.pipe(take(3), rxjs.filter(x=>x.clientX<300)).subscribe(console.log) //先进入take筛选3次, 小于300才会执行console


      //! Subject
      const subject = new rxjs.Subject(); //建立主体物件, 之后要靠这个主体物件进行广播
      clicks$ = clicks$.pipe(take(2));    //暂定2笔后取消订阅
      clicks$.subscribe(subject);         //将observable交给subject广播
      //! 目前看是可以把pipe分开执行
      const subs1$ = subject.pipe(rxjs.filter(x=>x.clientX<300)).subscribe(console.log);//用subject把可观察对象订阅给观察者
      const subs2$ = subject.subscribe(console.log);
      //subs1$.unsubscribe();
      //subs2$.unsubscribe();

      //互动式弹珠图 Operator => http://rxmarbles.com
      //动画 RxJS Explorer / Launchpad for RxJS
    },

    day2(){
      const button = document.querySelector('button');
      const clicks$ = rxjs.fromEvent(button, 'click');
      const document$ = rxjs.fromEvent(document, 'click');

      // clicks$
      //     //scan 操作符的工作原理与数组的 reduce 类似。它需要一个暴露给回调函数当参数的初始值。每次回调函数运行后的返回值会作为下次回调函数运行时的参数。
      //     .pipe(rxjs.scan(count => count + 1, 0))
      //     .subscribe(count => console.log(`Clicked ${count} times`));


      //Operator小记
      //imp 流程控制操作符

      //filter:  true时继续flow
      // filter(x=>x>100);
      // clicks$.filter(ele => ele.target.tagName === 'div');

      //delay
      //debounceTime
      //take
      //takeUntil
      //  distinct:  去重
      // rxjs.of(1, 1, 2, 2, 2, 1, 2, 3, 4, 3, 2, 1)
      //     .pipe(rxjs.distinct())
      //     .subscribe(console.log); // 1, 2, 3, 4

      // rxjs.of({ age: 4, name: 'Foo'},
      //         { age: 4, name: 'Bar'},
      //         { age: 5, name: 'Foo'})
      //     .pipe(rxjs.distinct(p => p.name))
      //     .subscribe(console.log); // 根据name去重
      //distinctUntilChanged: 直到改变 (1, 1, 2, 2, 2, 1, 2, 2, 3, 3, 4) => 1,2,1,2,3,4

      //imp 产生值的操作符
      //scan
      rxjs.fromEvent(document, 'click')
          .pipe(
              rxjs.throttleTime(300),
              rxjs.map(e=>{
                return {x:e.clientX, y:e.clientY} //作为下游的obj返回
              }),
              rxjs.scan((val, obj) => val + obj.x + obj.y, 0) //返回一个新的值, 点击的所有x坐标与y坐标的和
          )
          .subscribe(console.log);

      //pluck 1.提取对象属性 2.提取嵌套属性
      const source = rxjs.from([
        { name: 'Joe', age: 30, job: { title: 'Developer', language: 'JavaScript' } },
        // 当找不到 job 属性的时候会返回 undefined
        { name: 'Sarah', age: 35 }
      ]);
      // 提取 job 中的 title 属性
      const example = source.pipe(rxjs.pluck('job', 'title'));
      // 输出: "Developer" , undefined
      const subscribe = example.subscribe(val => console.log(val));

      //pairwise 当满足2个流时, 返回n和n-1个的数据
      // document$.pipe(rxjs.pairwise(), rxjs.map(e=>{
      //   return {
      //     x1: e[0].clientX, //n-1个的x坐标
      //     x2: e[1].clientX, //n个的x坐标    --如可以动态计算两次点击的距离
      //     y1: e[0].clientY,
      //     y2: e[1].clientY,
      //   }
      // })).subscribe(console.log)

      //sample
      //每1秒发出值 5,10,15,20,...
      const sourceSample = rxjs.interval(1000).pipe(rxjs.scan(v=>v+5,0));
      //每2秒对源 observable *最新* 发出的值进行取样
      const exampleSample = sourceSample.pipe(rxjs.sample(rxjs.interval(2000))).pipe(rxjs.take(3));
      //输出: 10, 20, 30
      exampleSample.subscribe(console.log);
    }
  }
}
</script>

<style scoped>

</style>
