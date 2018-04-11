
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
            if(!$("#playerBoard").hasClass("hidden")) {
                $("#playerBoard").addClass("hidden");
            }
        };
        function showBoard() {
            if($("#playerBoard").hasClass("hidden")) {
                $("#playerBoard").removeClass("hidden");
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
            
            boardHtml += createBoardHeaderHtml();
            
            var rowHtml, rowData, columnData, classesText;
            for(var row = 0; row < numberOfRows; row++){
                // div around the whole row
                rowHtml = "<div class='rowDiv'>";
                rowData = "data-row='" + row + "'";
                // row number indicator
                rowHtml += "<div class='cellDiv' >" + (row + 1) + "</div>";
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
             buildABoard("Enemies Board", myBattleShip.boardTypes.enemy, currentPlayer.enemyBoard);
            // build your board
             buildABoard("Your Board", myBattleShip.boardTypes.player, currentPlayer.playerBoard);
            
            calculateAndSetBoardWidth();
            addClickToBoards();
        };
        
        // depricated!
        function createBoardHeaderHtml() {
            // builds the top row with column numbers
            // first, wrapper around the whole row
            var headerHtml = "<div class='rowDiv'>"; 
            // this is an empty cell for the top corner
            headerHtml += "<div class='cellDiv' ></div>";
            for(var column = 0; column < numberOfColumns; column++){
                headerHtml += "<div class='cellDiv' >" + (column + 1) +  "</div>";
            }
            headerHtml += "</div>"; // end row
            return headerHtml;
        };
        
        function calculateAndSetBoardWidth() {
            // calculate how wide we want our board area to be, so that it shows up nicely
            // in the center of the screen
            var cellWidth = $(".cellDiv:first").outerWidth();
            var left = parseInt( $(".boardDiv").css("marginLeft"));
            var right = parseInt($(".boardDiv").css("marginRight"));
            var actualNumberOfColumns = $(".rowDiv:first > .cellDiv").length;
            var boardWitdh = (actualNumberOfColumns * cellWidth) + left + right;
            $("#playerBoard").width(boardWitdh);
        };
        
        // ---------------------------------------
        // game logic functions
        // ---------------------------------------
        function displayTurnStart(attacker, defender){
            // display interface to wait for a player to start their turn
            hideBoard();
            $("#waitLabel").text(attacker.playerName + "'s turn!");
            showWaitRoom();
        };
        
        function setupPlayerTurn(){
            // player is there and ready to play!
            hideWaitRoom();
            buildGameBoards();
            showBoard();
        };
        
        function someoneWon(winningPlayer, loosingPlayer){
            alert(winningPlayer.playerName + " has TRUMPED " + loosingPlayer.playerName);
            restartClicked();
        };
        
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
            
            showLobby();
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