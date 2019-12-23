$(function () {
  // 滚动条样式js
  $(".music-list-box").mCustomScrollbar({
    scrollbarPosition: "outside"
  });

  // 保存播放模式
  let playMode =  "listCirculation"
  let playModeList = ["listCirculation" , "singleCirculation" , "randomCirculation"]

  // 获取歌曲列表，保存json中的歌曲列表数组
  let musicListArr = []
  getMusicList()
  function getMusicList() {
    $.ajax({
      url: "./source/musiclist.json",
      datatype: "json",
      success: function (res) {
        musicListArr = res
        // 在页面中展示每个歌曲（创建li）
        $.each(musicListArr , function (index , item) {
          createMusicListDOM(item , index)
        })
        player.musicList = res
        // 更新歌词
        updateLyric($(".music-list-item").get(0).obj)
      },
      error: function (err) {
        console.log(err)
      }
    })
  }

  // 将保存实例的变量提升到顶部，以供使用
  let musicProgress;
  let lyric;

  // 当前选中的歌曲序号
  let currentMusicIndex = 0

  let $audio = $("audio")
  let audio = $audio[0]
  // 创建一个播放组件类
  let player = new Player($audio)
  player.updateMusicTime(function (currentTime , totalTime , dateStr) {
    // 获取当前歌曲播放的百分比
    let percent = currentTime / totalTime
    //获取进度条总长度
    let totalWidth = $musicLonger.width()
    // 同步进度条
    $musicShorter.css("width" , totalWidth * percent)
    // 将转换完的播放时间更新到界面
    $(".player-music-time .now-time").html(dateStr)
    // 若播放完成进行下一首
    if (currentTime == totalTime) {
      $(".player-control-next").trigger("click")
    }
    let currentIndex = lyric.currentLyric(currentTime) // 返回的是当前播放的歌词index
    // 获取歌词区域的div
    let $lyricBox = $(".music-lyric-box")
    // 找到当前播放的歌词p，添加class
    $lyricBox.find("p").eq(currentIndex).addClass("current-lyric")
    // 移出其他歌词p的播放效果class
    $lyricBox.find("p").eq(currentIndex).siblings().removeClass("current-lyric")
    // 将歌词移动到中间（就是移动歌词外的div） 移动当前播放歌词元素的前面所有元素高度和
    // 前两个元素的高度和
    let totalHeight = 0
    /*if (currentIndex == lyric.times.length - 1 ) {
      console.log("到底了")
      return
    }else */if (currentIndex >= 2) {  // 如果前面有两个元素
      for (let i = currentIndex - 1 ; i >= 0 ; i--) {
        let prevHeight = $lyricBox.find("p").eq(i).height()
        totalHeight +=  prevHeight
      }
    }else if(currentIndex == 1){
      let prevHeight = $lyricBox.find("p").eq(0).height()
      totalHeight +=  prevHeight
    }else {
      totalHeight = 0
    }
    $lyricBox.css("transform" , "translateY("+ ( - totalHeight) +"px)")
  })


  // 创建歌曲播放进度条事件
  let $musicLonger = $(".music-lyric-progress")
  let $musicShorter = $(".lyric-progress-shorter")
  let $musicDot = $(".lyric-progress-dot")
  musicProgress = Progress($musicLonger,$musicShorter,$musicDot)
  musicProgress.progressClick(function (value) {
    // 传过来的value为当前位置占总宽度的比例
    player.goToPlayTime(value)
  })
  musicProgress.dotMove(function (value) {
    // 传过来的value为当前位置占总宽度的比例
    player.goToPlayTime(value)
  })

  // 创建声音控制
  let $volumeLonger = $(".footer-volume-progress")
  let $volumeShorter = $(".volume-progress-shorter")
  let $volumeDot = $(".volume-progress-dot")
  let volumeProgress = Progress($volumeLonger,$volumeShorter,$volumeDot)
  volumeProgress.progressClick(function (value) {
    // 音量控制为 0-1 整数 ，所以
    // console.log(value) // 为 0.84 小数
    if (value < 0) {
      value = 0
    }else if(value > 1){
      value = 1
    }
    let vol = value
    audio.volume = vol
  })
  // volumeProgress.dotMove(function (value) {
  // })


  // 创建更新歌词函数
  function updateLyric(music) {
    // 获取保存在歌曲li中的对象数据
    let path = music.link_lrc
    // 创建歌词处理实例
    lyric = Lyric(path)
    // 获取歌词区域的div
    let $lyricBox = $(".music-lyric-box")
    // 删除上次的歌词
    $lyricBox.html("")
    // 调用歌词处理函数
    lyric.updateLyric(function () {
      // 将歌词添加进div
      $.each(lyric.lyrics , function (index , element) {
        let $childP = $("<p>" + element +"</p>")
        $lyricBox.append($childP)
      })
      // console.log(lyric.times , lyric.lyrics)
    })
  }


  // 初始化进度条
  $musicShorter.css("width" , 0)

  // 初始化监听事件
  initEvent()
  function initEvent() {
    // 利用委托给每个歌曲li添加mouseover事件
    $(".music-list").on("mouseover" , ".music-list-item" , function () {
      // this就是提出委托的li(music-list-item)
      // 操作图标显示元素显示
      $(this).find(".music-item-icon").stop().show()
      // 时间隐藏，删除图标显示
      $(this).find(".music-item-time span").addClass("a-i-fade-show")
      $(this).find(".music-item-time a").removeClass("a-i-fade-show")
    })

    // 利用委托给每个歌曲li添加mouseout事件
    $(".music-list").on("mouseout" , ".music-list-item" , function (event) {
      // 操作图标显示元素隐藏
      $(this).find(".music-item-icon").stop().hide()
      // 时间显示，删除图标隐藏
      $(this).find(".music-item-time a").addClass("a-i-fade-show")
      $(this).find(".music-item-time span").removeClass("a-i-fade-show")
    })

    // 利用委托给每个歌曲li添加click事件切换被选中状态
    $(".music-list").on("click" , ".music-item-choose", function () {
      $(this).find("i").toggleClass("checked")
    })

    // 利用委托给每个歌曲li添加删除当前歌曲
    $(".music-list").on("click" , ".music-item-delete", function () {

      // 如果删除的是当前歌曲，播放下一首，要保持正确播放顺序，播放下一首必须在删除的前面
      if ($(this).parents(".music-list-item")[0].index === currentMusicIndex) {
        $(".player-control-next").trigger("click")
        console.log(currentMusicIndex)
      }

      // 点击删除当前歌曲li
      $(this).parents(".music-list-item").remove()
      // 改变Player类中的歌曲列表
      player.changeMusic($(this).parents(".music-list-item")[0].index)
      // 重新排序
      $(".music-list-item").each(function (index , element) {
        element.index = index
        $(element).find(".music-item-number").html(index + 1)
      })

    })

    // 利用委托给每个歌曲li添加播放歌曲事件
    $(".music-list").on("click" , ".music-item-play", function () {
      // 获取当前点击播放的歌曲序号
      let index = $(this).parents("li").get(0).index
      console.log(currentMusicIndex , index)


      if (index != currentMusicIndex){ // 如果点击的歌曲不为当前播放歌曲，则初始化进度条
        // 初始化进度条
        $musicShorter.css("width" , 0)
      }

      // 更新歌词
      updateLyric($(this).parents("li").get(0).obj)


      // 更新歌曲信息
      updateMusicInfo($(this).parents(".music-list-item")[0].obj)

      // 列表中当前点击的播放图标状态改变
      $(this).toggleClass("play-now")

      // 判断是否处于播放状态
      if ($(this).hasClass("play-now")){ // 没有play-now类名说明没在播放，所以添加播放状态
        // 播放歌曲
        player.playMusic($(this).parents("li")[0])
        console.log($(this).parents("li")[0].index,$(this).parents("li")[0])

        // 当前列表中的文字高亮
        $(this).parents(".music-list-item").find("a").css("color" , "rgba(255,255,255,1)")
        // 将序号变为播放gif图片
        $(this).parents(".music-list-item").find(".music-item-number").addClass("play-now")

        // 下方播放器图标状态同步
        $(".player-control-pause").addClass("play-now")
      }else {
        // 暂停歌曲
        player.pauseMusic()


        // 当前列表中的文字低亮
        $(this).parents(".music-list-item").find("a").css("color", "rgba(255,255,255,.5)")
        // 将播放gif图片变为序号
        $(this).parents(".music-list-item").find(".music-item-number").removeClass("play-now")

        // 下方播放器图标状态同步
        $(".player-control-pause").removeClass("play-now") // 如果点击的歌是正在播放的歌，则取消播放状态
      }

      // 其他的播放图标状态复原
      $(this).parents(".music-list-item").siblings().find(".music-item-play").removeClass("play-now")
      // 将其他的文字低亮
      $(this).parents(".music-list-item").siblings().find("a").css("color" , "rgba(255,255,255,.5)")
      // 将其他播放gif图片变为序号
      $(this).parents(".music-list-item").siblings().find(".music-item-number").removeClass("play-now")

      // 保存当前选中的歌曲序号
      currentMusicIndex = index
    })

    // 为下方播放器添加播放点击事件
    $(".player-control-pause").on("click" , function () {
      // 切换下方播放器播放状态
      $(this).toggleClass("play-now")

      // 同步列表中正在播放的歌曲播放状态
      // 将目标保存到一个变量上
      let $item = $(".music-list-item").eq(currentMusicIndex)
      if ($(this).hasClass("play-now")) { // 下方播放器为播放状态时
        // 播放当前暂停歌曲
        $item.find(".music-item-play").trigger("click")

        // 当前列表中播放的文字高亮
        $item.find("a").css("color", "rgba(255,255,255,1)")
        // 将序号变为播放gif图片
        $item.find(".music-item-number").addClass("play-now")
      }else {
        //  暂停歌曲
        player.pauseMusic()

        // 当前播放图标变为暂停
        $item.find(".music-item-play").removeClass("play-now")
        // 当前列表中的文字低亮
        $item.find("a").css("color", "rgba(255,255,255,.5)")
        // 将播放gif图片变为序号
        $item.find(".music-item-number").removeClass("play-now")


      }
    })

    // 为下方播放器添加上一首点击事件
    $(".player-control-prev").on("click" , function () {
      $(".music-list-item").eq(player.prevMusic()).find(".music-item-play").trigger("click")
    })

    // 为下方播放器添加下一首点击事件
    $(".player-control-next").on("click" , function () {
      // 下一首要播放的index
      let index = player.nextMusic()

      // 根据播放模式切换歌曲index
      switch (playMode) {
        case "listCirculation":
          $(".player-control-pause").trigger("click")
          break
        case "singleCirculation":
          console.log("我进来了")
          index = currentMusicIndex
          break
        case "randomCirculation":
          // 获取列表中随机一个数
          let randomNum = Math.floor(Math.random() * $(".music-list-item").length)
          index = randomNum
          break
      }
      console.log('singleCirculation' , index)
      $(".music-list-item").eq(index).find(".music-item-play").trigger("click")
    })


    // 添加纯净模式点击事件
    $(".footer-pure").on("click" , function () {
      // 切换纯净模式
      $(this).toggleClass("pure-on")

      if ($(this).hasClass("pure-on")) {
        // 如果开启纯净模式，歌词区域添加class，让其充满整个屏幕
        $(".music-lyric").addClass("pure-on")
        // 显示纯净模式蒙版
        $(".pure-on-mask").css("display" , "block")
        console.log($(".pure-on-mask").css("display"))
      }else {
        // 如果关闭纯净模式，恢复原状
        $(".music-lyric").removeClass("pure-on")
        // 隐藏纯净模式蒙版
        $(".pure-on-mask").css("display" , "none")
      }
    })

    // 添加播放模式切换事件
    let changeModeIndex = 0
    $(".footer-play-mode").on("click" , function () {
      changeModeIndex++
      if (changeModeIndex > playModeList.length-1) {
        changeModeIndex = 0
      }
      playMode = playModeList[changeModeIndex]
      console.log(changeModeIndex)
      console.log($('.footer-play-mode').css("background"))
      console.log(playMode)
      switch (changeModeIndex) {
        case 0:
          $('.footer-play-mode').css("backgroundPosition" , '0 -205px')
          break
        case 1:
          $('.footer-play-mode').css("backgroundPosition" , '0 -232px')
          break
        case 2:
          $('.footer-play-mode').css("backgroundPosition" , '0 -71.55px')
          break
      }
    })

  }

  // 创建更新歌曲信息函数
  function updateMusicInfo(music) {
    $(".music-info-img-main").attr("src" , music.cover)
    $(".music-info-text-name a").html(music.name)
    $(".music-info-text-singer a").html(music.singer)
    $(".music-info-text-album a").html(music.album)
    $(".bg-cover").css("backgroundImage" , 'url("'+ music.cover +'")')

    // 更新下方播放器歌曲信息
    $(".player-music-name").html(music.name)
    $(".player-music-singer").html(music.singer)
    $(".player-music-time .total-time").html(music.time)
    $(".player-music-time .now-time").html("00:00")

  }


  // 创建并歌单li对象到list
  function createMusicListDOM(obj , index) {
    let $li = $(`
      <li class="music-list-item">
        <div class="music-item-choose"><a href="javascript:;"><i></i></a></div>
        <div class="music-item-number">${index + 1}</div>
        <div class="music-item-name">
          <a>${obj.name}</a>
          <div class="music-item-icon">
            <a href="javascript:;" class="music-item-play"></a>
            <a href="javascript:;" class="music-item-add"></a>
            <a href="javascript:;" class="music-item-download"></a>
            <a href="javascript:;" class="music-item-share"></a>
          </div>
        </div>
        <div class="music-item-singer"><a href="javascript:;">${obj.singer}</a></div>
        <div class="music-item-time"><span>${obj.time}</span><a href="javascript:;" class="music-item-delete a-i-fade-show"></a></div>
      </li>
    `)
    $li.get(0).index =  index
    $li.get(0).obj = obj
    let $ul = $(".music-list")
    $ul.append($li)
  }
})