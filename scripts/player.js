var battleShip = (function (myBattleShip){

    var blockWidth = 2;
    var blockHeight = 2;
    var lineLength = 4;

    function createAndPlaceShip(shipName, boardPlacingOn, boardWidth, boardHeight, width, height, addingBend) {
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
            heightMax = boardHeight - (height - 1);
            row = Math.floor(Math.random() * heightMax);

            sections = tryFindBlockSpace(boardPlacingOn, width, height, row, column);
            
            if(addingBend && sections
                && !tryAddLBend(boardPlacingOn, boardWidth, boardHeight, 
                    row, column, width, height, sections)) {
                // we tried to add in an L bend, but failed... restart the process
                // for finding a location for this L bend!
                sections = "";
            }
            // we found a random place for our block
            if(sections){

                ship = Object.create(myBattleShip.Ship);
                ship.init(shipName, sections);
                sections.forEach(function(section){
                    boardPlacingOn[section.row][section.column] = section.state;
                });
            }
        }
        
        return ship;
    };

    function tryAddLBend(boardPlacingOn, boardWidth, boardHeight, 
        row, column, width, height, sections){
        var placed = false;
        // 0 = nw, 1 = ne, 2 = sw, 3 = se
        var posibleCorners = [0, 1, 2, 3];
        while(!placed && posibleCorners.length > 0){
            // randomly determine which corner we want to put this bend on
            // try one location at a time till we find one that works
            var randomCornerIndex = Math.floor(Math.random() * posibleCorners.length);
            var randomCorner = posibleCorners[randomCornerIndex];
            // we remove the locations we have tried as we go along so we only
            // try each location once
            posibleCorners.splice(randomCornerIndex, 1);

            var cornerRow = row;
            var cornerColumn = column;

            if(width > height){
                // we are laying on our side
                switch(randomCorner){
                    case 0:
                        cornerRow -= 1;
                       break;
                    case 1:
                        cornerRow -= 1;
                        cornerColumn += (width - 1);
                       break;
                    case 2:
                        cornerRow += 1;
                       break;
                    case 3:
                        cornerRow += 1;
                        cornerColumn += (width - 1);
                       break;
                    default:
                        cornerRow = -1;
                        cornerColumn = -1;
                       break;
                }
            } else {
                // we are straight up and down
                switch(randomCorner){
                    case 0:
                        cornerColumn -= 1;
                       break;
                    case 1:
                        cornerColumn += 1;
                       break;
                    case 2:
                        cornerRow += (height - 1);
                        cornerColumn -= 1;
                       break;
                    case 3:
                        cornerRow += (height - 1);
                        cornerColumn += 1;
                       break;
                    default:
                        cornerRow = -1;
                        cornerColumn = -1;
                       break;
                }
            }
            if(cornerRow < boardHeight && cornerRow > 0
                && cornerColumn < boardWidth && cornerColumn > 0
                && boardPlacingOn[cornerRow][cornerColumn] === myBattleShip.boardStates.openWater){

                placed = true;
                var shipSection = Object.create(myBattleShip.ShipSection);
                shipSection.init(cornerRow, cornerColumn);
                sections.push(shipSection);
                return true;
            }
        }
        return false;
    };
    
    function tryFindBlockSpace(boardPlacingOn, width, height, row, column){
        var shipSection, hitSomething;
        var sections = [];
        for(var i = 0; i < width; i++){
            for(var j = 0; j < height; j++){
                if(boardPlacingOn[row + j][column + i] === myBattleShip.boardStates.openWater){
                    shipSection = Object.create(myBattleShip.ShipSection);
                    shipSection.init(row + j, column + i);
                    sections.push(shipSection);
                } else {
                    hitSomething = true;
                    sections = "";
                    break;
                }
            }
            if(hitSomething){
                break;
            }
        }
        return sections;
    };

    myBattleShip.Player = {
        init: function(playerName, playerColor, boardWidth, boardHeight) {
            this.firedThisTurn = false;
            this.playerName = playerName;
            this.playerColor = playerColor;
            this.boardWidth = boardWidth;
            this.boardHeight = boardHeight;
            this.shotsFired = 0;
            this.misses = 0;

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
        getShipsSunkCount: function() {
            var sunkCount = 0;
            for(var i = 0; i < this.ships.length; i++){
                if(!this.ships[i].stillFloating())
                    sunkCount += 1;
            }
            return sunkCount;
        },
        shotFired: function(row, column){
            if(this.playerBoard[row][column] === myBattleShip.boardStates.undamaged){
                this.ships.some(function(ship) {
                    return ship.sections.some(function(section){
                        if(section.row === row && section.column === column){
                            section.state = myBattleShip.boardStates.damaged;
                            if(!ship.stillFloating()){
                                $("#feedback").text("You sunk my " + ship.shipName + " ship!");
                            }
                            return true;
                        }
                        return false;
                    })
                });
                // mark on our board where shots have landed
                this.playerBoard[row][column] = myBattleShip.boardStates.damaged;
                return myBattleShip.boardStates.damaged;
            }
            this.playerBoard[row][column] = myBattleShip.boardStates.miss;
            return myBattleShip.boardStates.miss;
        },
        updateEnemyBoard: function(shotResult, row, column) {
            this.shotsFired += 1;
            if(shotResult === myBattleShip.boardStates.miss){
                this.misses += 1;
            }
            this.enemyBoard[row][column] = shotResult;
        },
        randomlyPlaceShips: function() {
            // L shape (3 tall, 2 wide at boot)
            this.ships.push(createAndPlaceShip("L", this.playerBoard,
                                            this.boardWidth, this.boardHeight,
                                            1, 3, true));

            // block (2x2)
            this.ships.push(createAndPlaceShip("Block", this.playerBoard,
                                            this.boardWidth, this.boardHeight,
                                            blockWidth, blockHeight));
            
            // two lines (4x1)
            this.ships.push(createAndPlaceShip("Line 1", this.playerBoard,
                                            this.boardWidth, this.boardHeight,
                                            1, lineLength));
            this.ships.push(createAndPlaceShip("Line 2", this.playerBoard,
                                            this.boardWidth, this.boardHeight,
                                            1, lineLength));
        }
    };
    
    return myBattleShip;
})(battleShip || {});