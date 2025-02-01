from flask import Flask,render_template


app = Flask(__name__)
@app.route('/')
def main():
    return render_template("yule/source/HomeTemplate.html", t_home='/#games')
@app.route('/PinballGame')
def PinballGame():
    return render_template("yule/source/PinballGame.html", t_home='/#games')
@app.route('/PlaneWarsGame')
def FlyGame():
    return render_template("yule/source/PlaneWarsGame.html", t_home='/#games')
@app.route('/GreedySnakeGame')
def GreedySnakeGame():
    return render_template("yule/source/GreedySnakeGame.html", t_home='/#games')
@app.route('/FruitNinjaGame')
def FruitNinjaGame():
    return render_template("yule/source/FruitNinjaGame.html", t_home='/#games')
@app.route('/MarioGame')
def MarioGame():
    return render_template("yule/source/MarioGame.html", t_home='/#games')
@app.route('/2048Game')
def TwentyFortyEightGame():
    return render_template("yule/source/TwentyFortyEightGame.html", t_home='/#games')
@app.route('/TetrisGame')
def TetrisGame():
    return render_template("yule/source/TetrisGame.html", t_home='/#games')
@app.route('/TwoPlayersTetrisGame')
def TwoPlayersTetrisGame():
    return render_template("yule/source/TwoPlayersTetrisGame.html", t_home='/#games')
@app.route('/T-RexDinoGame')
def T_RexDinoGame():
    return render_template("yule/source/T-RexDinoGame.html", t_home='/#games')
@app.route('/MinesweeperGame')
def MinesweeperGame():
    return render_template("yule/source/MinesweeperGame.html", t_home='/#games')
@app.route('/WordleGame')
def WordleGame():
    return render_template("yule/source/WordleGame.html", t_home='/#games')
@app.route('/wordlist')
def get_wordlist():
    with open('source/wordlist.txt', 'r', encoding='utf-8') as file:
        return file.read()
@app.route('/csw22')
def get_csw22():
    with open('source/CSW22.txt', 'r', encoding='utf-8') as file:
        return file.read()


if __name__ == '__main__':
    app.run(port = 8080, debug = True)