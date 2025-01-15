from flask import Flask,render_template


app = Flask(__name__)
@app.route('/')
def main():
    return render_template("HomeTemplate.html", t_home='/#games')
@app.route('/PinballGame')
def PinballGame():
    return render_template("PinballGame.html", t_home='/#games')
@app.route('/PlaneWarsGame')
def FlyGame():
    return render_template("PlaneWarsGame.html", t_home='/#games')
@app.route('/GreedySnakeGame')
def GreedySnakeGame():
    return render_template("GreedySnakeGame.html", t_home='/#games')
@app.route('/FruitNinjaGame')
def FruitNinjaGame():
    return render_template("FruitNinjaGame.html", t_home='/#games')
@app.route('/MarioGame')
def MarioGame():
    return render_template("MarioGame.html", t_home='/#games')
@app.route('/2048Game')
def TwentyFortyEightGame():
    return render_template("TwentyFortyEightGame.html", t_home='/#games')
@app.route('/TetrisGame')
def TetrisGame():
    return render_template("TetrisGame.html", t_home='/#games')
@app.route('/TwoPlayersTetrisGame')
def TwoPlayersTetrisGame():
    return render_template("TwoPlayersTetrisGame.html", t_home='/#games')
@app.route('/T-RexDinoGame')
def T_RexDinoGame():
    return render_template("T-RexDinoGame.html", t_home='/#games')
@app.route('/MinesweeperGame')
def MinesweeperGame():
    return render_template("MinesweeperGame.html", t_home='/#games')
@app.route('/WordleGame')
def WordleGame():
    return render_template("WordleGame.html", t_home='/#games')
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