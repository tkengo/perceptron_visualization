/**
 * パーセプトロンを生成する。
 * @param int dim データの次元数
 */
var Perceptron = function(dim) {
  this.trainingData = [];
  this.w = [];

  for (var i = 0; i < dim; i++) {
    this.w[i] = Math.random();
  }
};

/**
 * 学習用データを設定する。
 * @param Array data 学習用データベクトルの配列
 * @param int label 学習用データの正解ラベル(1 or -1)
 */
Perceptron.prototype.addTrainingData = function(data, label) {
  for (var i = 0; i < data.length; i++) {
    this.trainingData.push({
      data: data[i],
      label: label
    });
  }
};

/**
 * 与えられたベクトルがどちらのラベルに属するか予測する。
 * @param Array v 判定するベクトル
 * @return int 判別されたラベル(1 or -1)
 */
Perceptron.prototype.predict = function(v) {
  var dots = 0;
  for (var i = 0; i < v.length; i++) {
    dots += this.w[i] * v[i];
  }
  return dots >= 0 ? 1 : -1;
}

/**
 * 学習用データを元に学習して重みを更新する。
 * @param int maxIteration 学習の繰り返し階数
 */
Perceptron.prototype.learn = function(maxIteration) {
  var data = shuffle(this.trainingData);
  for (var i = 0; i < data.length; i++) {
    var t = data[i].label;
    var x = data[i].data;
    var y = this.predict(x);
    if (t * y < 0) {
      for (var j = 0; j < this.w.length; j++) {
        this.w[j] += t * x[i];
      }
    }
  }
};
