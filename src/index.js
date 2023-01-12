import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
    return (
        <button 
          className={props.win && (
           props.number == props.win[0] ||
           props.number == props.win[1] || 
           props.number == props.win[2] )? 
           'square win-square' : 'square'} 
          onClick={props.onClick}>
            {props.value}
        </button>
    )
}
  
  class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square 
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                key={i}
                number={i}
                win={this.props.winSquare}
            />
        )
    }

    render() {  
      let countRow = 3
      let countColumn =3

      let content = []

      for (let i = 0; i < countRow*countColumn; i+=3) {
        let contentRow = []
        for (let j = 0; j < countColumn; j++) {
          contentRow.push(this.renderSquare(i+j))
        }
        content.push(<div key={i} className='board-row'>{contentRow}</div>)
      }

      return content
    }
  }

  class SortButton extends React.Component {
    constructor(props) {
      super(props)
      this.state = {isToggleOn: true}
      this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
      this.props.sortMoves()
      this.setState(prevState => ({
        isToggleOn: !prevState.isToggleOn
      }))
    }

    render() {
      return (
        <button onClick={this.handleClick}>
          {this.state.isToggleOn ? 'отсортировать по убыванию' : 'отсортировать по возрастанию' }
        </button>
      )
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                squareNumber: null,
                winSquare: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            activeHistory: null,
            isToggleOn: true,
        }
        this.sortMoves = this.sortMoves.bind(this)
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber +1)
        const current = history[history.length-1]
        const squares = current.squares.slice()
        if (calculateWinner(squares).winner || squares[i]) {
            return
        } 
        squares[i] = this.state.xIsNext ? 'X' : 'O'
        this.setState({
            history: history.concat([{
                squares: squares,
                squareNumber: i,
                winSquare: calculateWinner(squares).squares
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            activeHistory: null,
        })
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            activeHistory: step
        })
    }

    sortMoves() {
      this.setState({
        isToggleOn: !this.state.isToggleOn
      })
    }

    render() {
        const history = this.state.history
        const current = history[this.state.stepNumber]
        const winner = calculateWinner(current.squares).winner
        const winSquare = current.winSquare

        const moves = history.map((step, move) =>{
            const column = step.squareNumber % 3 +1
            const row = Math.floor(step.squareNumber / 3) +1
            const desc = move ?
                'Перейти к ходу #' + move + " (колонка " + column + ", строка " + row + ")":
                'К началу игры'
            return (
                <li key={move}>
                    <button className={this.state.activeHistory == move ? "button_red" : ""} onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            )
        });

        moves.sort((a,b) => { 
          if(this.state.isToggleOn) 
            return a.key > b.key ? 1 : -1
          else
            return a.key < b.key ? 1 : -1
        })

        let status
        if(winner) {
            status = 'Win ' + winner
        } else if(current.squares.every(elem => elem != null)) {
          status = 'Draw'
        } else {
          status = 'Next move ' + (this.state.xIsNext ? 'X' : 'O')
        }


      return (
        <div className="game">
          <div className="game-board">
            <Board 
                squares={current.squares}
                onClick={(i) => this.handleClick(i)}
                winSquare={current.winSquare}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ul>{moves}</ul>
            <SortButton
              sortMoves={this.sortMoves}
            />
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Game />);
  
  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return {winner:squares[a], squares:[a,b,c]};
      }
    }
    return {winner:null, squares:[null,null,null]};
  }