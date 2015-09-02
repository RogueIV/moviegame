var engine = function() {
  var isAdmin = false,
      dataAll, questionTypes, ResultTypes, currentQuestion, currentStreak,
      initialize, generateQuestion, checkAnswer,
      generateResult, getAnswerChoices, getUntakenChoice, getCorrectChoice,
      normalizeData, getRandomItem, sortChoices, calculateAgeSpan,
      enableAnswers, rollChoice;

  initialize = function(data, qtList, rtList, startImmediately) {
      questionTypes = qtList || questionTypes;
      resultTypes = rtList || resultTypes;
      dataAll = normalizeData(data);
      currentStreak = 0;

      $('.generate').on('click', function() {
          startNewQuestion();
      });

      if(startImmediately) { startNewQuestion(); } else { $('.generate')[0].show(); }
  };

  startNewQuestion = function() {
      $('.generate').hide();
      $('.choices').hide();
      $('.result').removeClass('correct').removeClass('incorrect');
      $('.result').hide();
      currentQuestion = generateQuestion();
      $('.question').text(currentQuestion.type.display);
      $('.choices').html('');
      $('.result').html('');
      $('.choices').show();
      $('.choices').css('display', 'flex');
      rollChoice(0, currentQuestion, 90);
  };

  generateQuestion = function() {
      var question = { type: getRandomItem(questionTypes, 'frequency') };
      question.choices = getAnswerChoices(dataAll, question.type);
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

      if(qt.calculation === 'birth') {
          detailValue = calculateAgeSpan(answer.birth, new Date());
          if(!isCorrect) {
              if(answer.birth > correctAnswer.birth) {
                  detailDiff = calculateAgeSpan(answer.birth, correctAnswer.birth);
              } else {
                  detailDiff = calculateAgeSpan(answer.birth, correctAnswer.birth);
              }
          }
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

          if(qt.calculation == 'birth') {
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

  normalizeData = function(raw) {
      return raw.map(function(datum) {
          return {
              id: datum.name.toLowerCase().split(' ').join('').split('\'').join('').split('.').join(''),
              name: datum.name,
              birth: new Date(datum.birth),
              birthdate: datum.birth,
              acting: datum.credits.acting,
              directing: datum.credits.directing,
              producing: datum.credits.producing,
              writing: datum.credits.writing,
              wins: datum.oscars.wins,
              nominations: datum.oscars.nominations,
              honorary: datum.oscars.honorary,
              firstCredit: datum.credits.first,
              lastCredit: datum.credits.last,
              career: (datum.credits.first > 0 && datum.credits.last > 0) ? (datum.credits.last - datum.credits.first) : 0,
              isActive: datum.credits.last ? datum.credits.last >= new Date().getFullYear() : false,
              image: datum.image
          };
      });
  };

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

  calculateAgeSpan = function(birthDate, otherDate, showYearsOnly) {
      var oneDay = 24*60*60*1000,
  		firstDate = new Date(birthDate),
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
              $('.generate.next').show();
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
