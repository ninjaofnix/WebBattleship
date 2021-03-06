
    var battleShip = (function (myBattleShip, $){
        
// sans-serif, Helvetica, Arial

        var currentPlayer, currentDefender;
        var numberOfRows = 8;
        var numberOfColumns = 8;
        
        myBattleShip.boardStates = {
            openWater: "openWater",
            miss: "miss",
            undamaged: "undamaged",
            damaged: "damaged"
        };
        
        myBattleShip.boardTypes = {
            player: "playerBoard",
            enemy: "enemyBoard"
        };
        
        // ---------------------------------------
        // visibility methods
        // ---------------------------------------
        function hideLobby() {
            if(!$("#lobby").hasClass("hidden")) {
                $("#lobby").addClass("hidden");
            }
        };
        function showLobby() {
            if($("#lobby").hasClass("hidden")) {
                $("#lobby").removeClass("hidden");
            }
        };
        
        function hideBoard() {
            if(!$("#playerSection").hasClass("hidden")) {
                $("#playerSection").addClass("hidden");
            }
        };
        function showBoard() {
            if($("#playerSection").hasClass("hidden")) {
                $("#playerSection").removeClass("hidden");
            }
        };
        
        function hideSummary() {
            if(!$("#summary").hasClass("hidden")) {
                $("#summary").addClass("hidden");
            }
        };
        function showSummary() {
            if($("#summary").hasClass("hidden")) {
                $("#summary").removeClass("hidden");
            }
        };

        function hideWaitRoom() {
            if(!$("#waitRoom").hasClass("hidden")) {
                $("#waitRoom").addClass("hidden");
            }
        };
        function showWaitRoom() {
            if($("#waitRoom").hasClass("hidden")) {
                $("#waitRoom").removeClass("hidden");
            }
        };
        
        // ---------------------------------------
        // game logic functions
        // ---------------------------------------
        function buildABoard(boardTitle, boardType, playerColor, boardToDisplay) {
            
            // div around the whole board we are building
            var colorStyle = "style='background-color:" + playerColor + ";'"
            var boardHtml = "<div class='centered' " + colorStyle + " ><label> " + boardTitle + "</label></div>";
            boardHtml += "<div class='boardDiv " + boardType + "' >";
            
            var rowHtml, rowData, columnData, classesText;
            for(var row = 0; row < numberOfRows; row++){
                // div around the whole row
                rowHtml = "<div class='rowDiv'>";
                rowData = "data-row='" + row + "'";

                for(var column = 0; column < numberOfColumns; column++){
                    columnData = "data-column='" + column + "'";
                    classesText = "class='cellDiv battleCell " + boardToDisplay[row][column] + "'";
                    rowHtml += "<div "+ classesText + " " + rowData + " " + columnData + " >";
                    rowHtml += "</div>";
                }
                rowHtml += "</div>";
                
                boardHtml += rowHtml;
            }
            
            // ending the div around the whole board
            boardHtml += "</div>";
            $("#playerBoard").append(boardHtml);
        };
        
        function buildGameBoards() {
            // clear the board so we can redisplay it!
            $("#playerBoard").empty();
            
            // build opponents board
             buildABoard("Enemy's Board", myBattleShip.boardTypes.enemy,
                currentDefender.playerColor,
                currentPlayer.enemyBoard);
            // build players board
             buildABoard(currentPlayer.playerName + "'s Board", myBattleShip.boardTypes.player,
                currentPlayer.playerColor,
                currentPlayer.playerBoard);

            updateInfoPanel();

            $("." + myBattleShip.boardTypes.enemy + " > .rowDiv > .battleCell").click(battleCellClicked);
        };

        function clonePlayer(playerToCloneFrom){
            var aCloneShip, shipSection, sections;
            var aClone = Object.create(myBattleShip.Player);

            aClone.init(playerToCloneFrom.playerName, playerToCloneFrom.playerColor, numberOfRows, numberOfColumns);

            aClone.firedThisTurn = playerToCloneFrom.firedThisTurn;
            aClone.shotsFired = playerToCloneFrom.shotsFired;
            aClone.misses = playerToCloneFrom.misses;
            aClone.playerBoard = playerToCloneFrom.playerBoard;
            aClone.enemyBoard = playerToCloneFrom.enemyBoard;

            aClone.ships = [];
            playerToCloneFrom.ships.forEach(function(ship){
                aCloneShip = Object.create(myBattleShip.Ship);
                sections = [];
                ship.sections.forEach(function(section){
                    shipSection = Object.create(myBattleShip.ShipSection);
                    shipSection.init(section.row, section.column);
                    shipSection.state = section.state;
                    sections.push(shipSection);
                });
                aCloneShip.init(aCloneShip.shipName, sections);
                aClone.ships.push(aCloneShip);
            });

            return aClone;
        }

        function displayTurnStart(){
            // display interface to wait for a player to start their turn
            hideBoard();
            $("#waitLabel").text(currentPlayer.playerName + "'s turn!");
            showWaitRoom();
            saveState();
        };
        
        function getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for(var i = 0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }


        function saveState(){
            var jsonPlayer = JSON.stringify(currentPlayer);
            var jsonDefender = JSON.stringify(currentDefender);
            setCookie("currentPlayer", jsonPlayer, 1);
            setCookie("currentDefender", jsonDefender, 1);
        }
        
        function setCookie(cname, cvalue, exdays) {
            var expires = "";
            if (exdays) {
                var date = new Date();
                date.setTime(date.getTime()+(exdays*24*60*60*1000));
                expires = "; expires="+date.toUTCString();
            }
            document.cookie = cname + "=" + cvalue + expires +"; path=/";
        }

        function setupPlayerTurn(){
            // player is there and ready to play!
            hideWaitRoom();
            buildGameBoards();
            showBoard();
            $("#feedback").text("");
        };
        
        function setupSummary(){
            var shipsSunk, shipsLeft;
            $("#winnerParagraph").text(currentPlayer.playerName + " has won at BattleShip!");

            shipsSunk = currentPlayer.getShipsSunkCount();
            shipsLeft = currentPlayer.ships.length - shipsSunk;

            $("#winners_shotsFired").text(currentPlayer.shotsFired);
            $("#winners_misses").text(currentPlayer.misses);
            $("#winners_shipsLeftFloating").text(shipsLeft);
            $("#winners_shipsSunk").text(shipsSunk);

            shipsSunk = currentDefender.getShipsSunkCount();
            shipsLeft = currentDefender.ships.length - shipsSunk;

            $("#lossers_shotsFired").text(currentDefender.shotsFired);
            $("#lossers_misses").text(currentDefender.misses);
            $("#lossers_shipsLeftFloating").text(shipsLeft);
            $("#lossers_shipsSunk").text(shipsSunk);
        }

        function someoneWon(){
            hideBoard();
            setupSummary();
            showSummary();
        };

        function switchPlayers(){
            var temp = currentPlayer;
            currentPlayer = currentDefender;
            currentDefender = temp;

            currentPlayer.firedThisTurn = false;
        }

        function updateInfoPanel(){
            $("#ShotsFired").text(currentPlayer.shotsFired);
            $("#Hits").text(currentPlayer.shotsFired - currentPlayer.misses);
            $("#Misses").text(currentPlayer.misses);
            $("#EnemyShipsSunk").text(currentDefender.getShipsSunkCount());
        };
        
        // ---------------------------------------
        // interaction functions
        // ---------------------------------------
        function battleCellClicked() {
            if(currentPlayer.firedThisTurn)
                return;
            
            var rowClicked = $(this).data("row");
            var columnClicked = $(this).data("column");
            
            // only do things when we have clicked on a space we haven't fired before
            if(currentPlayer.enemyBoard[rowClicked][columnClicked] === myBattleShip.boardStates.openWater){
                var shotResult = currentDefender.shotFired(rowClicked, columnClicked);
                currentPlayer.updateEnemyBoard(shotResult, rowClicked, columnClicked);
                currentPlayer.firedThisTurn = true;

                buildGameBoards();
                $("#endTurnButton").removeAttr("disabled");
                saveState();
                
                if(!currentDefender.hasShipsRemaining()){
                    someoneWon(currentPlayer, currentDefender);
                }
            }
        };
        
        function endTurnClicked() {
            $("#endTurnButton").attr("disabled", "disabled");
            switchPlayers();
            
            displayTurnStart(currentPlayer, currentDefender);
        };
        
        function readyClicked() {
            setupPlayerTurn();
        };
        
        function restartClicked() {
            currentPlayer = {};
            currentDefender = {};

            document.cookie = "currentPlayer=; path=/";
            document.cookie = "currentDefender=; path=/";

            hideWaitRoom();
            hideBoard();
            hideSummary();
            showLobby();
        };
        
        function startClicked(){
            // create two players
            currentPlayer = Object.create(myBattleShip.Player);
            currentPlayer.init("Player 1", "#73adf5", numberOfRows, numberOfColumns);
            currentPlayer.randomlyPlaceShips();
            
            currentDefender = Object.create(myBattleShip.Player);
            currentDefender.init("Player 2", "#8be674",numberOfRows, numberOfColumns);
            currentDefender.randomlyPlaceShips();
            
            hideLobby();
            
            displayTurnStart(currentPlayer, currentDefender);
        };
        
        // ---------------------------------------
        // public facing methods
        // ---------------------------------------
        myBattleShip.createABoard = function(width, height){
            var aBoard = [];
            for(var w = 0; w < width; w++){
                aBoard[w] = [];
                for(var h = 0; h < height; h++){
                    aBoard[w][h] = myBattleShip.boardStates.openWater;
                }
            }
            return aBoard;
        };

        myBattleShip.init = function (){
            $("#startButton").click(startClicked);
            $("#hereButton").click(readyClicked);
            $("#endTurnButton").click(endTurnClicked);
            $("#restartGame").click(restartClicked);
            $("#endTurnButton").attr("disabled", "disabled");

            var jsonPlayer = getCookie("currentPlayer");
            var jsonDefender = getCookie("currentDefender");

            if(jsonPlayer && jsonDefender){
                // json objects don't keep methods, so recreate our objects with methods
                currentPlayer = clonePlayer(JSON.parse(jsonPlayer));
                currentDefender = clonePlayer(JSON.parse(jsonDefender));

                // if the player has already fired, just skip to the next persons turn
                if(currentPlayer.firedThisTurn){
                    switchPlayers();
                }
                displayTurnStart();
            } else {
                showLobby();
            }
        };
        
        
        return myBattleShip;
    })(battleShip || {}, jQuery);