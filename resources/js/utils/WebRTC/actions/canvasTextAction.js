module.exports = () => {

  const action = {};

  action.setup = () => {
    this.lineCount = 4;
    this.fontRatio = 0.05;
    this.fontName = 'Roboto';
    this.fontColor = '#333';
    this.intervalTime = 15;

    this.x = 0;
    this.y = 0;
    this.textHeight = 0;
    this.startHeight = 60;
    this.lineHeight = 0;
    this.canvas = document.getElementById('canvas-text-scroll-section');
    this.canvasText = document.getElementById('canvas-text');
    this.context = this.canvas.getContext('2d');
    this.canvasText.style.display = 'block';
    this.canvas.style.display = 'block';

    this.canvas.width = document.getElementById("canvas-text-action-card").offsetWidth;
    this.maxWidth = this.canvas.width;

    this.fontSize = this.fontRatio * this.canvas.width;
    //this.lineHeight = parseInt(((this.canvas.height - (this.lineCount * this.fontSize)) / (this.lineCount - 1)) + this.fontSize);
    this.lineHeight = parseInt(this.canvas.height / this.lineCount);
    this.context.font = (this.fontSize / 16).toString() + 'em ' + this.fontName;
    this.context.fillStyle = this.fontColor;
    this.context.scale = 1;
    this.startHeight = this.canvas.height + 30;


    this.debug = document.getElementById('canvas-text-action-counter');
    this.counter = 0;
    this.debug.innerHtml = "0";
  }

  action.run = (parent, data) => {


    if (data.attributes.play) {
      action.setup();
      this.interval = setInterval(action.renderText, 1000 / this.intervalTime, data.attributes.message);
    } else {
      this.canvas.style.display = 'none';
      this.canvasText.style.display = 'none';
      clearInterval(this.interval);
    }
  }

  action.renderText = (text) => {
      // debug section
      this.counter++;
      this.debug.innerHTML = 'Interval: ' + this.counter.toString() + ' | TextHeight: ' + this.textHeight.toString() +
        ' | LineHeight: ' + this.lineHeight.toString() + ' | font: ' + this.fontSize.toString() +
        ' | width: ' + this.canvas.width.toString() + ' | height: ' + this.canvas.height.toString();
      //

      if(this.textHeight == 0) {
        this.y = this.startHeight;
      } else {
        this.y -= 1;

        if (this.y < (this.textHeight * -1)) {
          this.y = this.startHeight;
        }
      }

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      action.wrapText(text, this.x, this.y);
  }

  action.wrapText = (text, x, y) => {
    let line = '';
    let lines = text.split(/\r?\n/);

    this.textHeight = 0;


    for (let i = 0; i < lines.length; i++) {
      let words = lines[i].split(' ');

      for(let j = 0; j < words.length; j++) {
        let testLine = line + words[j] + ' ';

        if (this.context.measureText(testLine).width > this.maxWidth && j > 0) {
          this.context.fillText(line, x, y);

          line = words[j] + ' ';
          y += this.lineHeight;
          this.textHeight += this.lineHeight;
        } else {
          line = testLine;
        }
      }

      this.context.fillText(line, x, y);
      line = '';

      y += this.lineHeight;
      this.textHeight += this.lineHeight;
    }


    if (this.textHeight == 0) {
      this.textHeight = this.lineHeight;
    }

    this.context.fillText(line, x, y);
  }

  return action;
}
