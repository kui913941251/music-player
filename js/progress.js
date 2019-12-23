(function (window) {

  function Progress($musicLonger,$musicShorter,$musicDot) {
    return new Progress.prototype.init($musicLonger,$musicShorter,$musicDot)
  }
  Progress.prototype = {
    constructor: Progress,
    init: function ($musicLonger,$musicShorter,$musicDot) {
      this.$musicLonger = $musicLonger
      this.$musicShorter = $musicShorter
      this.$musicDot = $musicDot
    },
    progressClick: function(callback) {
      // 保存this
      let $this = this
      // 保存进度条距离左屏幕的距离
      let leftDistance = $this.$musicLonger.offset().left
      // 保存进度条的总宽度
      let totalWidth = $this.$musicLonger.width()
      this.$musicLonger.on("click" , function (event) {
        // 获取点击位置距离左屏幕的距离
        let eventLeft = event.pageX
        // 设置进度条的宽度
        $this.$musicShorter.css("width" , eventLeft - leftDistance)
        // 计算播放进度占总宽度的比例
        let ratio = (eventLeft - leftDistance) / totalWidth
        // 返回参数
        callback(ratio)
      })
    },
    isMove: false , // 设置节流阀，使在移动时不播放
    dotMove: function (callback) {
      // 保存this
      let $this = this
      // 保存进度条距离左屏幕的距离
      let leftDistance = $this.$musicLonger.offset().left
      // 保存进度条的总宽度
      let totalWidth = $this.$musicLonger.width()
      this.$musicDot.on("mousedown" , function (event) {
        event.stopPropagation()
        $(document).on("mousemove" , function (event) {
          // 获取事件位置距离左屏幕的距离
          let eventLeft = event.pageX
          if ((eventLeft - leftDistance) <= totalWidth) {
            // 设置进度条的宽度
            $this.$musicShorter.css("width" , eventLeft - leftDistance)
          }
        })

        $(document).on("mouseup" , function (event) {
          $(document).off("mousemove")
          // 获取事件位置距离左屏幕的距离
          let eventLeft = event.pageX
          // 计算播放进度占总宽度的比例
          let ratio = (eventLeft - leftDistance) / totalWidth
          // 返回参数
          callback(ratio)
        })
      })
    },


  }

  Progress.prototype.init.prototype = Progress.prototype
  window.Progress = Progress
})(window)