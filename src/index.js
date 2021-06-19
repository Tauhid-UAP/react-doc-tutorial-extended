import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className="square"
            style={{backgroundColor: props.backgroundColor}}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, winningSquare) {
        return (
            <Square
                value={this.props.squares[i]}
                backgroundColor={winningSquare ? "yellow": "white"}
                onClick={() => this.props.onClick(i)}
                key={i}
            />
        );
    }

    render() {
        // list of divs
        // each of which represent a row
        const rowDivs = [];
        for(let i=0; i < 9; i += 3){
            // list of Square elements
            // in the current row
            let squaresInRow = [];
            for(let j=i; j < (i + 3); j++){
                let winningSquare = false;
                if(this.props.winningSquares && (this.props.winningSquares.indexOf(j) !== -1)){
                    // if the winningSquares prop is not null
                    // and if the index of the element j is not -1
                    // i.e, the element was found
                    // the current square is a winning square
                    winningSquare = true;
                }

                console.log('j: ', j);
                console.log('winningSquares: ', this.props.winningSquares);
                console.log('winningSquare: ', winningSquare);

                squaresInRow.push(this.renderSquare(j, winningSquare));
            }

            // create a div to enclose the squares in the row
            // push the div to the list of row divs
            rowDivs.push(React.createElement("div", {className: "board-row", key: i}, squaresInRow));
        }
        
        return (
            <div>
                {rowDivs}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
            ascendingNow: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if(calculateWinner(squares) || squares[i]){
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                moveSquareNumber: i,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step){
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    toggleOrder(){
        this.setState({
            ascendingNow: !this.state.ascendingNow,
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        // if there is a winner
        // winner will contain an array of two items
        // first item will be the mark of the winner
        // the second will be another array
        // containing the numbers of the winning squares
        const winner = calculateWinner(current.squares);

        let moves = history.map((step, move) => {
            let moveSquareNumber = step.moveSquareNumber;
            // column number will be modular with 3
            let moveCol = moveSquareNumber % 3;
            console.log('moveCol: ', moveCol);
            // row number will be the integer quotient after dividing by 3
            let moveRow = Math.trunc(moveSquareNumber / 3);
            console.log('moveRow: ', moveRow);

            // movCol and movRow will be NaN at move 0
            // as moveSquareNumber will be Null
            
            const desc = move ?
                'Go to move #' + move + (' (' + moveCol + ', ' + moveRow + ')'):
                'Go to game start';

            console.log('move: ', move);
            console.log('stepNumber: ', this.state.stepNumber);
            console.log('move === stepNumber: ', move === this.state.stepNumber);

            return (
                <li key={move}>
                    <button
                        style={move === this.state.stepNumber ?
                            {backgroundColor: "yellow"}:
                            {backgroundColor: 'white'}}

                        onClick={() => this.jumpTo(move)}
                    >
                        {desc}
                    </button>
                </li>
            );
        });

        let toggleText = 'Descending';
        if(!this.state.ascendingNow){
            // if ascendingNow is false
            // reverse the moves array
            // <li> enumeration will remain the same
            moves = moves.slice(0).reverse();
            toggleText = 'Ascending';
        }
        
        let status;
        if(winner) {
            status = 'Winner: ' + winner[0];
        }else if(this.state.stepNumber === 9){
            // if 9 steps have passed
            // without any winner
            // then its a draw
            status = 'Draw';
        }else{
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winningSquares={winner ? winner[1]: null}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
                <div>
                    <button onClick={() => this.toggleOrder()}>{toggleText}</button>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

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

    for (let i=0; i < lines.length; i++){
        const [a, b, c] = lines[i];
        if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]){
            // if square value at the index
            // specified by the first element of the line exists
            // compare it to the other square values in the line

            // if three adjacent or diagonal squares
            // have the same mark
            // return the mark and the square numbers
            return [squares[a], [a, b, c]];
        }
    }
    return null;
}