var engine = function() {
  var isAdmin = false, statCallback,
      dataAll, questionTypes, ResultTypes, currentQuestion, currentStreak,
      initialize, generateQuestion, checkAnswer,
      generateResult, getAnswerChoices, getUntakenChoice, getCorrectChoice,
      normalizeData, getRandomItem, sortChoices, calculateAgeSpan,
      enableAnswers, rollChoice;

  initialize = function(data, qt, rtList, startImmediately, callback) {
      questionTypes = qt.questionTypes;
      resultTypes = rtList;
      dataAll = qt.normalizeData(data) || data;
      statCallback = callback;
      currentStreak = 0;

      $('.next').off('click').on('click', function() {
          startNewQuestion();
      });

      if(startImmediately) { startNewQuestion(); } else { $('.generate')[0].show(); }
  };

  startNewQuestion = function() {
      $('.choices').hide();
      $('.result').removeClass('correct').removeClass('incorrect');
      $('.result').hide();
      currentQuestion = generateQuestion();
      $('.question').text(currentQuestion.display);
      $('.choices').html('');
      $('.result').html('');
      $('.choices').show();
      $('.choices').css('display', 'flex');
      rollChoice(0, currentQuestion, 90);
  };

  generateQuestion = function() {
      var question = { type: getRandomItem(questionTypes, 'frequency') },
          displayValues = '';

      question.choices = getAnswerChoices(dataAll, question.type);
      question.display = question.type.display;
      if(question.type.calculationType === 'list') {
          displayValues = $.grep(question.choices, function(choice) {
              return choice.correct;
          })[0][question.type.calculation];
          question.display = question.display.split('{val}').join(getRandomItem(displayValues));
      }
      return question;
  };

  checkAnswer = function(answerId) {
      var correctAnswer = $.grep(currentQuestion.choices, function(e){ return e.correct; })[0],
          answer = $.grep(currentQuestion.choices, function(e){ return e.id == answerId; })[0],
          isCorrect = answer.id === correctAnswer.id,
          qt = currentQuestion.type,
          detailValue = correctAnswer[qt.calculation],
          detailIncorrectValue = answer[qt.calculation],
          detailDiff = Math.abs(detailValue - detailIncorrectValue),
          resultDetail = isCorrect ? qt.correct : qt.incorrect;
          detailParsed = resultDetail.split('|'),
          isPlural = detailValue > 1,
          finalResult = detailParsed[0];

      if(qt.calculationType === 'date') {
          if(qt.valueFrom) {
            detailValue = calculateAgeSpan(detailValue, qt.valueFrom);
            detailIncorrectValue = calculateAgeSpan(detailIncorrectValue, qt.valueFrom);
          } else {
            detailValue = detailValue.getFullYear();
            detailIncorrectValue = detailIncorrectValue.getFullYear();
          }
          if(!isCorrect) {
              if(answer[qt.calculation] > correctAnswer[qt.calculation]) {
                  detailDiff = calculateAgeSpan(answer[qt.calculation], correctAnswer[qt.calculation]);
              } else {
                  detailDiff = calculateAgeSpan(answer[qt.calculation], correctAnswer[qt.calculation]);
              }
          }
      }
      if(qt.calculationType == 'currency') {
          detailValue = '$' + detailValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").replace('.00','');
          detailIncorrectValue = '$' + detailIncorrectValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").replace('.00','');
          detailDiff = '$' + detailDiff.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").replace('.00','');
      }

      if(resultDetail.indexOf('{diff}') > 0) { isPlural = detailDiff > 1; }
      if(resultDetail.indexOf('{ival}') > 0) { isPlural = detailIncorrectValue > 1; }
      if(isPlural && detailParsed.length > 1) { finalResult += detailParsed[1]; }
      if(!isPlural && detailParsed.length > 2) { finalResult += detailParsed[2]; }

      finalResult = finalResult.split('{cname}').join(correctAnswer.name)
          .split('{iname}').join(answer.name)
          .split('{val}').join(detailValue)
          .split('{ival}').join(detailIncorrectValue)
          .split('{diff}').join(detailDiff);

      return {
          isCorrect: isCorrect,
          display: generateResult(isCorrect, currentStreak, finalResult),
          incorrectId: answerId,
          correctId: correctAnswer.id
      };
  };

  generateResult = function(isCorrect, streak, detail) {
      var answerLevel = (isCorrect && streak < 0) || (!isCorrect && streak > 1) ? 0 : streak,
          choices = $.grep(resultTypes.slice(), function(choice) {
              return choice.isCorrect == isCorrect && choice.streak <= (Math.abs(answerLevel) || 0);
          }),
          choice = getRandomItem(choices, 'streak');

      return choice.format.split('{detail}').join(detail);
  };

  getAnswerChoices = function(data, qt) {
      var allChoices = data.slice(),
          whereChoices = [],
          choices = [],
          choice;

      if(qt.minimum) {
          allChoices = $.grep(allChoices, function(choice) {
              if(qt.calculationType === 'list') { return true; }
              return choice[qt.calculation] >= qt.minimum;
          });
      }

      if(qt.where >= 0) {
          whereChoices = $.grep(allChoices, function(choice) {
              return choice[qt.calculation] == qt.where;
          });
          choice = getUntakenChoice(choices, whereChoices, qt);
          choice.correct = true;
          choices.push(choice);
          allChoices = $.grep(allChoices, function(choice) {
              return choice[qt.calculation] != qt.where;
          });
      }

      if(qt.calculationType === 'list') {
          whereChoices = $.grep(allChoices, function(choice) {
              return choice[qt.calculation + 'Count'] >= qt.minimum;
          });
          choice = getUntakenChoice(choices, whereChoices, qt);
          choice.correct = true;
          choices.push(choice);
      }

      for(var i = choices.length; i < qt.choiceCount; i++) {
          choice = getUntakenChoice(choices, allChoices, qt);
          choice.correct = false;
          choices.push(choice);
      }
      choice = getCorrectChoice(choices, qt);
      if(choice) { choice.correct = true; }

      return sortChoices(choices, 'name');
  };

  getUntakenChoice = function(taken, allChoices, qt) {
  	var answerChoice = getCorrectChoice(taken, qt),
        takenIds = taken.map(function(item) { return item.id; }).join('|'),
        upperLimit = 0,
        lowerLimit = 0,
        orderBit = (qt.order && qt.order === 'desc')? -1 : 1,
        choices = $.grep(allChoices.slice(), function(choice) {
            if(answerChoice) {
                return (choice[qt.calculation] != answerChoice[qt.calculation])
                    && takenIds.indexOf(choice.id) < 0;
            }
            return true;
        }),
        limitedChoices = choices.slice();

      if(qt.spread && answerChoice) {
          upperLimit = answerChoice[qt.calculation] + qt.spread;
          upperLimit = answerChoice[qt.calculation] - qt.spread;

          if(qt.calculationType == 'date') {
              upperLimit = new Date('1/1/' + answerChoice[qt.calculation].getFullYear() + (qt.spread));
              lowerLimit = new Date('1/1/' + answerChoice[qt.calculation].getFullYear() - (qt.spread));
          }

          if(upperLimit && lowerLimit) {
              limitedChoices = $.grep(choices, function(choice) {
                  return choice[qt.calculation] >= lowerLimit && choice[qt.calculation] <= upperLimit;
              });
          }
      }

      if(limitedChoices.length < (qt.choiceCount - taken.length)) { limitedChoices = choices.slice(); }
      return getRandomItem(limitedChoices);
  };

  getCorrectChoice = function(choices, qt) {
      var ordered = (choices && qt ) ? sortChoices(choices.slice(), qt.calculation, qt.order) : null;
      if(ordered && ordered.length > 0) { return ordered[0]; }
      return null;
  }

  getRandomItem = function(list, weightBy)
  {
      var isWeighted = weightBy && list[0][weightBy];

      return list.map(function(item) {
          return {obj: item, score: Math.random() * (isWeighted? +item[weightBy] : 1)}
      }).reduce(function(max, current) {
          return current.score > max.score ? current : max;
      }).obj;
  };

  sortChoices = function(data, calc, order) {
  	return data.sort(function(a,b) {
          var orderBit = order === 'desc'? -1 : 1,
              comparer = (a[calc] == b[calc]) ? 0 : +(a[calc] > b[calc]) || -1;
          return comparer*orderBit;
      });
  };

  calculateAgeSpan = function(targetDate, otherDate, showYearsOnly) {
      var oneDay = 24*60*60*1000,
      		firstDate = new Date(targetDate),
      		secondDate = new Date(otherDate),
      		days = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay))),
          months = Math.floor(days/30),
          years = Math.floor(days/365.24);

      if(showYearsOnly) { return years; }
      if(years == 1) { return '1 year'; }
      if(years > 1) { return years + ' years'; }
      if(months == 1) { return '1 month'; }
      if(months > 1) { return months + ' months'; }
      if(days == 1) { return '1 day' }
      return days + ' days';
  };

  enableAnswers = function(isEnabled) {
      $('.choice').off('click')
      if(isEnabled) {
          $('.choice').on('click', function() {
              var result = checkAnswer($(this).data('id'));
              if(currentStreak <= 0 && result.isCorrect) { currentStreak = 0; }
              if(currentStreak >= 0 && !result.isCorrect) { currentStreak = 0; }
              currentStreak += result.isCorrect ? 1 : -1;
              $('.result').text(result.display);
              $('.choice[data-id="' + result.incorrectId + '"] > .overlay').addClass('incorrect');
              $('.choice[data-id="' + result.correctId + '"] > .overlay').addClass('correct');
              $('.result').addClass(result.isCorrect? 'correct' : 'incorrect');
              $('.result').show();
              enableAnswers(false);
              if(statCallback) { statCallback(result, currentStreak); }
          });
      }
  };

  rollChoice = function(index, question, delay) {
      delay = delay || 250;
      if(index < question.choices.length) {
          var choice = question.choices[index];

          if(isAdmin) {
              $('.choices').append('<li class="choice" data-id="' + choice.id + '">' + choice.name + ' (' + choice[question.type.calculation] + ')</li>');
          } else {
              $('.choices').append('<li class="choice" data-id="' + choice.id + '">'
                  + (choice.image ? ('<img src="' + choice.image + '">') : '')
                  + '<div class="overlay"></div>'
                  + '<div class="nametag' + (choice.image ? '' : ' middle') + '">' + choice.name + '</div>'
                  + '</li>');
          }
          setTimeout(function() {
              rollChoice(index + 1, question, delay);
          }, delay);
      } else {
          enableAnswers(true);
      }
  };

  return {
    init: initialize
  }
}();
