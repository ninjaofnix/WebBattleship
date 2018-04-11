var battleShip = (function (myBattleShip){
    
    myBattleShip.Ship = {
        init: function(sections) {
            this.sections = sections;
        },
        stillFloating: function() {
            for(var i = 0; i < this.sections.length; i++){
                if(this.sections[i].state === myBattleShip.boardStates.undamaged)
                    return true;
            }
            return false;
        }
    };
    
    myBattleShip.ShipSection = {
        init: function(row, column) {
            this.row = row;
            this.column = column;
            this.state = myBattleShip.boardStates.undamaged;
        }
    };
    
    return myBattleShip;
})(battleShip || {});