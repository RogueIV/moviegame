var game = function() {
  var LOCAL_STORAGE_KEY = 'moviegamestats',
      gameEngine, gameStats, gameCategories, gameResultTypes, gameCategory, isStarted = false,
      initialize, toggleMenu, loadStats, addStat, displayStats;

  initialize = function(engine, categories, resultTypes) {
      gameEngine = engine;
      gameCategories = categories;
      gameResultTypes = resultTypes;
      gameStats = loadStats();

      $('.categories').html();
      categories.forEach(function(category) {
          $('.categories').append('<li data-id="' + category.id + '">' + category.display + '</li>');
      });

      $('.categories > li').off('click').on('click', function() {
          try {
              var catId = $(this).data('id'),
                  thisCategory = $.grep(categories, function(cat) {
                      return cat.id === catId;
                  })[0],
                  thisData = eval(thisCategory.data),
                  thisQuestionTypes = eval(thisCategory.questionTypes);

              gameCategory = thisCategory;
              if(thisData && thisQuestionTypes) {
                  $('.error').hide();
                  $('.start-page').hide();
                  $('.game-board').fadeIn(500, function() {
                      gameEngine.init(thisData, thisQuestionTypes,gameResultTypes, true, addStat);
                  });
              } else {
                  $('.error').show();
              }
          } catch(e) {
              $('.error').show();
          }
      });

      $('.menu-button').on('click', function() {
          toggleMenu();
      });

      $('.actions > li').on('click', function() {
          var action = $(this).data('action');
          if(action === 'new') {
              $('.game-board').hide();
              $('.game-board .choices').html('');
              $('.game-board .choices').hide();
              $('.result').hide();
              $('.start-page').show();
          }
          if(action === 'reset') {
              gameStats = loadStats(true);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameStats));
          }
          toggleMenu();
      });
  };

  toggleMenu = function() {
      $('.menu').removeClass('on');
      if($('.menu').not(':visible')) {
          displayStats();
          $('.menu').addClass('on');
      }
      $('.menu').toggle();
  };

  loadStats = function(reset) {
      var stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if(stored && !reset) { return JSON.parse(stored); }
      stored = {categories: []};
      categories.forEach(function(category) {
          stored.categories.push({id: category.id, display: category.display, correct: 0, incorrect: 0, bestStreak: 0, worstStreak: 0});
      });

      return calculateStatTotals(stored);
  };

  addStat = function(result, streak) {
      var stat = $.grep(gameStats.categories, function(st) {
          return st.id === gameCategory.id;
      })[0];
      if(!stat) {
        stat =   gameStats.categories.push({id: gameCategory.id, display: gameCategory.display, correct: 0, incorrect: 0, bestStreak: 0, worstStreak: 0});
      }
      stat.correct += result.isCorrect? 1 : 0;
      stat.incorrect += result.isCorrect? 0 : 1;
      if(streak > stat.bestStreak) { stat.bestStreak = streak; }
      if(streak < stat.worstStreak) { stat.worstStreak = streak; }
      gameStats = calculateStatTotals(gameStats);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameStats));
      isStarted = true;
  };

  calculateStatTotals = function(stats) {
      stats.correct = 0;
      stats.incorrect = 0;
      stats.bestStreak = 0;
      stats.worstStreak = 0;
      stats.categories.forEach(function(cat) {
          stats.correct += cat.correct;
          stats.incorrect += cat.incorrect;
          if(cat.bestStreak > stats.bestStreak) { stats.bestStreak = cat.bestStreak; }
          if(cat.worstStreak < stats.worstStreak) { stats.worstStreak = cat.worstStreak; }
      });
      return stats;
  };

  displayStats = function() {
    var total = 0,
        percentage;

    $('.stats').html('');
        if(gameStats) {
            $('.stats').append('<table><tr><th></th><th></th><th></th><th colspan="2" class="h">Streak</th></tr></table>');
            $('.stats > table').append('<tr><th></th><th class="h">Win-Loss</th><th class="h">%</th><th class="h">Win</th><th class="h">Lose</th></tr>');
            gameStats.categories.forEach(function(cat) {
                total = cat.correct + cat.incorrect;
                percentage = (100*cat.correct/total).toFixed(1) + '%';
                $('.stats > table').append('<tr><td class="h">' + cat.display + '</td>'
                  + '<td>' + cat.correct + '-' + cat.incorrect + '</td>'
                  + '<td>' + (total > 0 ? percentage : '') + '</td>'
                  + '<td>' + cat.bestStreak + '</td>'
                  + '<td>' + Math.abs(cat.worstStreak) + '</td></tr>');
            });
            total = gameStats.correct + gameStats.incorrect;
            percentage = (100*gameStats.correct/total).toFixed(1) + '%';
            $('.stats > table').append('<tr class="total"><td class="h">Total</td>'
              + '<td>' + gameStats.correct + '-' + gameStats.incorrect + '</td>'
              + '<td>' + (total > 0 ? percentage : '') + '</td>'
              + '<td>' + gameStats.bestStreak + '</td>'
              + '<td>' + Math.abs(gameStats.worstStreak) + '</td></tr>');
        }
  };

  getStats = function() {
      return gameStats;
  }

  return {
      init: initialize,
      stats: getStats
  }
}();
