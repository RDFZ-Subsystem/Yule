from flask import Flask,render_template


app = Flask(__name__)
@app.route('/')
def main():
    return render_template("HomeTemplate.html")
@app.route('/PinballGame')
def PinballGame():
    return render_template("PinballGame.html")
@app.route('/PlaneWarsGame')
def FlyGame():
    return render_template("PlaneWarsGame.html")
@app.route('/GreedySnakeGame')
def GreedySnakeGame():
    return render_template("GreedySnakeGame.html")
@app.route('/FruitNinjaGame')
def FruitNinjaGame():
    return render_template("FruitNinjaGame.html")
@app.route('/MarioGame')
def MarioGame():
    return render_template("MarioGame.html")
@app.route('/2048Game')
def TwentyFortyEightGame():
    return render_template("TwentyFortyEightGame.html")
@app.route('/TetrisGame')
def TetrisGame():
    return render_template("TetrisGame.html")
@app.route('/TwoPlayersTetrisGame')
def TwoPlayersTetrisGame():
    return render_template("TwoPlayersTetrisGame.html")
@app.route('/T-RexDinoGame')
def T_RexDinoGame():
    return render_template("T-RexDinoGame.html")
@app.route('/MinesweeperGame')
def MinesweeperGame():
    return render_template("MinesweeperGame.html")


if __name__ == '__main__':
    app.run(port = 8080, debug = True)