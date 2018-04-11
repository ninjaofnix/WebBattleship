var battleShip = (function (myBattleShip){

    var blockWidth = 2;
    var blockHeight = 2;
    var lineLength = 4;
    
    
    myBattleShip.Player = {
        init: function(playerName, boardWidth, boardHeight) {
            this.firedThisTurn = false;
            this.playerName = playerName;
            this.boardWidth = boardWidth;
            this.boardHeight = boardHeight;

            this.playerBoard = myBattleShip.createABoard(this.boardWidth, this.boardHeight);
            
            this.enemyBoard = myBattleShip.createABoard(this.boardWidth, this.boardHeight);

            this.ships = [];
        },
        hasShipsRemaining: function() {
            for(var i = 0; i < this.ships.length; i++){
                if(this.ships[i].stillFloating())
                    return true;
            }
            return false;
        },
        shotFired: function(row, column){
            if(this.playerBoard[row][column] === myBattleShip.boardStates.undamaged){
                this.ships.some(function(ship) {
                    return ship.sections.some(function(section){
                        if(section.row === row && section.column === column){
                            section.state = myBattleShip.boardStates.damaged;
                            return true;
                        }
                        return false;
                    })
                });
                return myBattleShip.boardStates.damaged;
            }
            return myBattleShip.boardStates.miss;
        },
        updateEnemyBoard: function(shotResult, row, column) {
            this.enemyBoard[row][column] = shotResult;
        },
        randomlyPlaceShips: function() {
            
            function TEST(number, times){
                for(var i = 0; i < times; i++){
                    if(Math.floor(Math.random() * number) === number){
                        console.log("hit max number: " + number);
                    }
                }
            }
            
            function createBlockShip(boardPlacingOn, boardWidth, boardHeight, width, height) {
                var ship, sections, shipSection, row, widthMax, column, heightMax;
                var hitSomething = false;
                
                while(!ship) {
                    hitSomething = false;
                    ship = '';
                    // randomly figure out if we want to rotate it, 50/50 chance
                    if(Math.random() < 0.5){
                        var temp = width;
                        width = height;
                        height = temp;
                    }

                    widthMax = boardWidth - (width - 1);
                    column = Math.floor(Math.random() * widthMax);
//                    
//                    console.log("column: " + column);
//                    console.log("width: " + width);
//                    console.log("max Width: "  + widthMax);
//                    
                    heightMax = boardHeight - (height - 1);
                    row = Math.floor(Math.random() * heightMax);
//                    
//                    console.log("row: " + row);
//                    console.log("height: " + height);
//                    console.log("max Height: " + heightMax);
//                    console.log(boardPlacingOn);

                    sections = [];
                    for(var i = 0; i < width; i++){
                        for(var j = 0; j < height; j++){
                            if(boardPlacingOn[row + j][column + i] === myBattleShip.boardStates.openWater){
                                shipSection = Object.create(myBattleShip.ShipSection);
                                shipSection.init(row + j, column + i);
                                sections.push(shipSection);
                            } else {
                                hitSomething = true;
                                break;
                            }
                        }
                        if(hitSomething){
                            break;
                        }
                    }
                    
                    if(!hitSomething){
                        ship = Object.create(myBattleShip.Ship);
                        ship.init(sections);
                        sections.forEach(function(section){
                            boardPlacingOn[section.row][section.column] = section.state;
                        });
                    }
                }
                
                return ship;
            };
            
            // block (2x2)
            this.ships.push(createBlockShip(this.playerBoard,
                                            this.boardWidth, this.boardHeight,
                                            blockWidth, blockHeight));
            
            // L shape (3 tall, 2 wide at boot)
            // two lines (4x1)
            this.ships.push(createBlockShip(this.playerBoard,
                                            this.boardWidth, this.boardHeight,
                                            1, lineLength));
            this.ships.push(createBlockShip(this.playerBoard,
                                            this.boardWidth, this.boardHeight,
                                            1, lineLength));
        }
    };
    
    return myBattleShip;
})(battleShip || {});