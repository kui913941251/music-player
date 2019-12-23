(function (window) {
  function Player($audio) {
    return new Player.prototype.init($audio)
  }

  Player.prototype = {
    constructor: Player,
    currentMusicIndex: -99, // 记录当前播放的歌曲
    musicList: [], // 保存歌单
    init: function ($audio) {
      this.$audio = $audio
      this.audio = $audio[0]
    },
    playMusic: function (music) { // 传过来的music有index，obj两个属性，保存的当前点击的值
      if (music.index === this.currentMusicIndex){
        this.audio.play()
      }else {
        this.$audio.attr("src" , music.obj.link_url)
        this.audio.play()
        this.currentMusicIndex = music.index
      }
    },
    pauseMusic: function () {
      this.audio.pause()
    },
    prevMusic: function () {
      let index = this.currentMusicIndex - 1
      if (index < 0){
        index = this.musicList.length - 1
      }
      return index
    },
    nextMusic: function () {
      let index = this.currentMusicIndex + 1
      if (index > this.musicList.length - 1) {
        index = 0
      }
      return index
    },
    changeMusic(index) {
      // 移出当前删除的歌曲
      this.musicList.splice(index , 1)
      // 判断歌曲是删除的前面的还是后面的
      if (index <= this.currentMusicIndex) {
        this.currentMusicIndex = this.currentMusicIndex - 1
      }
    },
    // 控制音乐播放的位置
    goToPlayTime(value) {
      // 保存传过来的比例
      let ratio = value
      // 获取总的播放时间
      let totalPlayTime = this.audio.duration
      // 计算当前应跳转到的时间
      let nowPlayTime = totalPlayTime * ratio
      // 跳转时间
      this.audio.currentTime = nowPlayTime
    },
    updateMusicTime(callback) {
      // 保存this
      let $this = this
      this.$audio.on("timeupdate" , function () {
        // 获取歌曲总时间
        let totalTime = $this.audio.duration
        // 获取当前播放时间
        let currentTime = $this.audio.currentTime
        // 获取当前播放时间的str
        let dateStr = $this.updateDateStr(currentTime)
        callback(currentTime, totalTime, dateStr)
      })
    },
    updateDateStr(currentTime) {
      // 将播放时间换成分秒
      let minutes = parseInt(currentTime / 60) < 10? "0" + parseInt(currentTime / 60) : parseInt(currentTime / 60)
      let second = parseInt(currentTime % 60) < 10 ? "0" + parseInt(currentTime % 60) : parseInt(currentTime % 60)
      // 转换格式
      let timeStr = minutes + ":" + second
      return timeStr
    }

  }

  Player.prototype.init.prototype = Player.prototype;

  window.Player = Player
})(window)