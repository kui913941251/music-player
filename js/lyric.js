(function (window) {
  function Lyric(path) {
    return new Lyric.prototype.init(path)
  }
  Lyric.prototype = {
    constructor: Lyric,
    init: function (path) {
      this.path = path
    },
    lyrics: [],
    times: [],
    updateLyric(callback){
      let $this = this
      $.ajax({
        url: this.path,
        dataType: "text",
        success(res) {
          $this.parseLyric(res)
          callback()
        },
        error(err) {
          console.log(err)
        }
      })
    },
    parseLyric(data) {
      let $this = this
      // 清除上次的歌词与时间
      this.lyrics= []
      this.times= []
      // 将字符串用空行符分成数组
      let dataArr = data.split("\n")
      // [00:00.92]告白气球 - 周杰伦
      $.each(dataArr , function (index , element) {
        // 将的到的数组中的元素，将时间与歌词拆开
        let lrc = element.split("]") // 得到["[00:00.92", "告白气球 - 周杰伦"]  或者["[00:03.79", ""]
        // 选择第二个元素[1]，先处理歌词
        if (lrc[1].length == 1) return true // 如果歌词只包含一个空字符串，则退出本次循环。否则就push到歌词数组里面
        $this.lyrics.push(lrc[1])

        // 创建正则表达式提出带有时间的元素
        let timeReg = /\[(\d+:\d+\.\d+)\]/
        let time = timeReg.exec(element)  // 返回一个数组  0: "[00:00.92]"  1: "00:00.92"  正则中加上括号为一个子元素，会另外返回
        if (time == null) return true
        let timeStr = time[1] // 拿到第二个元素  1: "00:00.92"
        time = timeStr.split(":") // 用冒号分出分与秒
        let minutes = parseFloat(time[0]) * 60
        let second = (parseFloat(time[1]) + minutes).toFixed(2)
        $this.times.push(second)
      })
    },
    currentLyric(currentTime) {
      for (let i = 0 ; i < this.times.length ; i++) {
        if(currentTime + 1 > this.times[this.times.length - 1]) {
        console.log("我进来了",currentTime)
        return this.times.length - 1
        }else if (currentTime + 1 > this.times[i] && currentTime < this.times[i+1]) {
          console.log(i , this.lyrics[i],currentTime)
          return i
        }
      }
      /*$.each(this.times , function (index , item) {
        if (currentTime > item) {
          currentIndex = index
          return false
        }
      })*/
    }
  }

  Lyric.prototype.init.prototype = Lyric.prototype
  window.Lyric = Lyric
})(window)