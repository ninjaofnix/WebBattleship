
    var battleShip = (function (myBattleShip, $){
        
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
        // setup functions
        // ---------------------------------------
        function addClickToBoards() {
            $("." + myBattleShip.boardTypes.enemy + " > .rowDiv > .battleCell").click(battleCellClicked)
        };
        
        function buildABoard(boardTitle, boardType, boardToDisplay) {
            
            // div around the whole board we are building
            var boardHtml = "<div class='centered'><label> " + boardTitle + "</label></div>";
            boardHtml += "<div class='boardDiv " + boardType + "' >";
            
            var rowHtml, rowData, columnData, classesText;
            for(var row = 0; row < numberOfRows; row++){
                // div around the whole row
                rowHtml = "<div class='rowDiv'>";
                rowData = "data-row='" + row + "'";
                // row number indicator
                // rowHtml += "<div class='cellDiv' >" + (row + 1) + "</div>";
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
             buildABoard("Enemy's Board", myBattleShip.boardTypes.enemy, currentPlayer.enemyBoard);
            // build your board
             buildABoard("Your Board", myBattleShip.boardTypes.player, currentPlayer.playerBoard);
            
            updateInfoPanel();

            addClickToBoards();
        };

        function updateInfoPanel(){
            $("#ShotsFired").text(currentPlayer.shotsFired);
            $("#Hits").text(currentPlayer.shotsFired - currentPlayer.misses);
            $("#Misses").text(currentPlayer.misses);
            $("#EnemyShipsSunk").text(currentDefender.getShipsSunkCount());
        };
        
        // ---------------------------------------
        // game logic functions
        // ---------------------------------------
        function displayTurnStart(attacker, defender){
            // display interface to wait for a player to start their turn
            hideBoard();
            $("#waitLabel").text(attacker.playerName + "'s turn!");
            showWaitRoom();
            saveState();
        };
        
        function setupPlayerTurn(){
            // player is there and ready to play!
            hideWaitRoom();
            buildGameBoards();
            showBoard();
        };
        
        function setupSummary(){
            var shipsSunk, shipsLeft;
            $("#winnerParagraph").text(currentPlayer.playerName + " has won at BattleShip!");

            shipsSunk = currentPlayer.getShipsSunkCount();
            shipsLeft = currentPlayer.ships.length - shipsSunk;

            $("#winners_shotsFired").text(currentPlayer.shotsFired);
            $("#winners_shipsLeftFloating").text(shipsLeft);
            $("#winners_shipsSunk").text(shipsSunk);

            shipsSunk = currentDefender.getShipsSunkCount();
            shipsLeft = currentDefender.ships.length - shipsSunk;

            $("#lossers_shotsFired").text(currentDefender.shotsFired);
            $("#lossers_shipsLeftFloating").text(shipsLeft);
            $("#lossers_shipsSunk").text(shipsSunk);
        }

        function someoneWon(){
            hideBoard();
            setupSummary();
            showSummary();
        };

        function setCookie(cname, cvalue, exdays) {
            var expires = "";
            if (exdays) {
                var date = new Date();
                date.setTime(date.getTime()+(exdays*24*60*60*1000));
                expires = "; expires="+date.toUTCString();
            }
            document.cookie = cname + "=" + cvalue + expires +"; path=/";
        }
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
        
        // ---------------------------------------
        // interaction functions
        // ---------------------------------------
        function battleCellClicked() {
            if(currentPlayer.firedThisTurn)
                return;
            
            var rowClicked = $(this).data("row");
            var columnClicked = $(this).data("column");
            //alert("row: " + rowClicked + " column: " + columnClicked);
            
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
        
        function startClicked(){
            // create two players
            currentPlayer = Object.create(myBattleShip.Player);
            currentPlayer.init("Player 1", numberOfRows, numberOfColumns);
            currentPlayer.randomlyPlaceShips();
            
            currentDefender = Object.create(myBattleShip.Player);
            currentDefender.init("Player 2", numberOfRows, numberOfColumns);
            currentDefender.randomlyPlaceShips();
            
            hideLobby();
            
            displayTurnStart(currentPlayer, currentDefender);
        };
        
        function readyClicked() {
            setupPlayerTurn();
        };
        
        function endTurnClicked() {
            $("#endTurnButton").attr("disabled", "disabled");
            var temp = currentPlayer;
            currentPlayer = currentDefender;
            currentDefender = temp;
            
            currentPlayer.firedThisTurn = false;
            displayTurnStart(currentPlayer, currentDefender);
        };
        
        function restartClicked() {
            currentPlayer = {};
            currentDefender = {};
            hideWaitRoom();
            hideBoard();
            hideSummary();
            showLobby();
        };
        
        // ---------------------------------------
        // public facing methods
        // ---------------------------------------
        myBattleShip.init = function (){
            $("#startButton").click(startClicked);
            $("#hereButton").click(readyClicked);
            $("#endTurnButton").click(endTurnClicked);
            $("#restartGame").click(restartClicked);
            $("#endTurnButton").attr("disabled", "disabled");
            


            var jsonPlayer;// = getCookie("currentPlayer");
            var jsonDefender;// = getCookie("currentDefender");

            if(jsonPlayer && jsonDefender){
                currentPlayer = JSON.parse(jsonPlayer);
                currentDefender = JSON.parse(jsonDefender);
                showWaitRoom();
            } else {
                showLobby();
            }
        };
        
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

        
        return myBattleShip;
    })(battleShip || {}, jQuery);