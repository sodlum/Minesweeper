(function () {
    var app = angular.module('Mines', []);

    app.controller('GridController', ['$interval', gridControllerMethod]);

    function gridControllerMethod($interval) {
        this.handleClick = function (evt, tile) {
            if (this.gameover) {
                return;
            }

            switch (evt.which) {
                case 1:
                    if (tile.isUncovered) {
                        tile.uncoverSurroundingTiles = true;
                    }
                    this.UncoverTile(tile, true);
                    break;
                case 2:
                    break;
                case 3:
                    this.ToggleFlag(tile);
                    break;
                default:
                    break;
            }
        }

        this.StartGame = function (form) {
            for (var y = 0; y < this.height; y++) {
                var row = [];
                for (var x = 0; x < this.width; x++) {
                    var tile = {
                        X: x,
                        Y: y,
                        isMine: false,
                        isUncovered: false,
                        isFlagged: false,
                        numNeighboringMines: 0,
                        numNeighboringFlags: 0,
                        surroundingTiles: [],
                        marker: ''
                    }

                    row.push(tile);
                }

                this.tileRows.push(row);
            }

            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    var tile = this.tileRows[y][x];

                    for (var yy = 0; yy < this.height; yy++) {
                        for (var xx = 0; xx < this.width; xx++) {
                            var currentTile = this.tileRows[yy][xx];

                            if (tile.X == currentTile.X + 1 && tile.Y == currentTile.Y + 1) {
                                tile.surroundingTiles.push(currentTile);
                            } else if (tile.X == currentTile.X && tile.Y == currentTile.Y + 1) {
                                tile.surroundingTiles.push(currentTile);
                            } else if (tile.X == currentTile.X - 1 && tile.Y == currentTile.Y + 1) {
                                tile.surroundingTiles.push(currentTile);
                            } else if (tile.X == currentTile.X + 1 && tile.Y == currentTile.Y) {
                                tile.surroundingTiles.push(currentTile);
                            } else if (tile.X == currentTile.X - 1 && tile.Y == currentTile.Y) {
                                tile.surroundingTiles.push(currentTile);
                            } else if (tile.X == currentTile.X + 1 && tile.Y == currentTile.Y - 1) {
                                tile.surroundingTiles.push(currentTile);
                            } else if (tile.X == currentTile.X && tile.Y == currentTile.Y - 1) {
                                tile.surroundingTiles.push(currentTile);
                            } else if (tile.X == currentTile.X - 1 && tile.Y == currentTile.Y - 1) {
                                tile.surroundingTiles.push(currentTile);
                            }
                        }
                    }
                }
            }

            this.canRenderBoard = true;
        };

        this.ToggleFlag = function (tile) {
            if (tile.isUncovered) {
                return false;
            }

            tile.isFlagged = !tile.isFlagged;

            if (tile.isFlagged) {
                this.totalFlags++;
            } else {
                tile.marker = '';
                this.totalFlags--;
            }

            for(var i = 0, il = tile.surroundingTiles.length; i < il; i++) {
                var t = tile.surroundingTiles[i];
                var numFlags = 0;
                
                if (t.isUncovered) {
                    for(var j = 0, jl = t.surroundingTiles.length; j < jl; j++) {
                        var st = t.surroundingTiles[j];

                        if (st.isFlagged) {
                            numFlags++;
                        }
                    }
                }

                t.numNeighboringFlags = numFlags;
            }

            return true;
        }

        this.generateMines = function (tile) {
            var tilesWithMines = [];
            var remainingTiles = {};
            var index = 0;
            var curTileIndex = 0;

            for (var v = 0, vl = this.tileRows.length; v < vl; v++) {
                var row = this.tileRows[v];

                for (var w = 0, wl = row.length; w < wl; w++) {
                    remainingTiles[index] = {
                        id: 'tile_' + row[w].X + '_' + row[w].Y,
                        tile: row[w]
                    }

                    if (remainingTiles[index].id == 'tile_' + tile.X + '_' + tile.Y) {
                        curTileIndex = index;
                    }

                    index++;
                }
            }
            
            delete remainingTiles[curTileIndex];

            while (tilesWithMines.length < this.totalMines) {
                do {
                    var x = Math.floor(Math.random() * (this.width - 1));
                    var y = Math.floor(Math.random() * (this.height - 1));
                    var coord = x + ',' + y;

                    if (tile.X != x && tile.Y != y && tilesWithMines.indexOf(coord) == -1) {
                        tilesWithMines.push(coord);
                        break;
                    }
                } while (true);
            }

            for (var i = 0; i < this.totalMines; i++) {
                var coor = tilesWithMines[i].split(',');
                x = coor[0];
                y = coor[1];
                var tl = null;

                for (var k = 0, kl = this.tileRows.length; k < kl; k++) {
                    var row = this.tileRows[k];

                    for (var l = 0, ll = row.length; l < ll; l++) {
                        var t = row[l];

                        if (t.X == x && t.Y == y) {
                            tl = t;
                            break;
                        }
                    }

                    if (tl) {
                        break;
                    }
                }

                if (tl.isMine) {
                    debugger;
                }

                tl.isMine = true;

                for (var j = 0, jl = tl.surroundingTiles.length; j < jl; j++) {
                    tl.surroundingTiles[j].numNeighboringMines++;
                }
            }
        }

        this.UncoverTile = function (tile, recursive) {
            if (!this.gameStarted) {
                this.generateMines(tile);
                this.gameStarted = true;

                var grid = this;
                this.interval = $interval(function () { grid.runningTime++; }, 1000);
            }

            if (tile.isFlagged) {
                return false;
            } else if (tile.isMine) {
                tile.isUncovered = true;
                this.gameover = true;
                this.endgamemessage = 'You lose!';
                this.endgameclass = 'red-text';
                $interval.cancel(this.interval);
                return false;
            } else if (tile.isUncovered) {
                if (tile.uncoverSurroundingTiles) {
                    tile.uncoverSurroundingTiles = false;
                    return this.UncoverTiles(tile);
                } else {
                    return true;
                }
            }

            tile.isUncovered = true;
            this.uncoveredTiles++;

            if (this.uncoveredTiles == (this.height * this.width) - this.totalMines) {
                this.gameover = true;
                this.endgamemessage = 'You win!';
                this.endgameclass = 'green-text';
                $interval.cancel(this.interval);
            }

            if (tile.numNeighboringMines > 0) {
                tile.marker = tile.numNeighboringMines;
            }

            if (tile.numNeighboringMines == 0 && recursive) {
                for (var i = 0, il = tile.surroundingTiles.length; i < il; i++) {
                    var mines = [];
                    var surroundingTile = tile.surroundingTiles[i];

                    for (var j = 0, jl = surroundingTile.surroundingTiles.length; j < jl; j++) {
                        if (surroundingTile.surroundingTiles[j].isMine) {
                            mines.push(surroundingTile.surroundingTiles[j]);
                        }
                    }

                    if (mines.length == 0) {
                        this.UncoverTile(surroundingTile, true);
                    } else {
                        this.UncoverTile(surroundingTile);
                    }
                }
            }

            return true;
        };

        this.UncoverTiles = function (tile) {
            var flaggedTiles = 0;

            for (var k = 0, kl = tile.surroundingTiles.length; k < kl; k++) {
                var r = tile.surroundingTiles[k];

                if (r.isFlagged) {
                    flaggedTiles++;
                }
            }

            if (flaggedTiles == tile.numNeighboringMines) {
                for (var i = 0, il = tile.surroundingTiles.length; i < il; i++) {
                    var t = tile.surroundingTiles[i];

                    if (!t.isUncovered && !t.isFlagged) {
                        var success = this.UncoverTile(t, true);

                        if (!success) {
                            return false;
                        }
                    }
                }
            }

            return true;
        };

        this.StartNew = function (grid) {
            this.tileRows = [];
            this.gameStarted = false;
            this.gameover = false;
            this.endgamemessage = null;
            this.uncoveredTiles = 0;
            this.runningTime = 0;
            this.totalFlags = 0;
            this.highlightCoveredTiles = false;

            if (grid) {
                this.totalMines = grid.totalMines;
                this.height = grid.height;
                this.width = grid.width;
                this.canRenderBoard = true;
                $interval.cancel(this.interval);
                this.StartGame();
            } else {
                this.totalMines = null;
                this.height = null;
                this.width = null;
                this.canRenderBoard = false;
            }

            this.interval = null;

        };

        this.StartNew();
    }
})();