var actorQuestions = {
    questionTypes: [
        { id: 'ageold2', frequency: 1, choiceCount: 2, calculation: 'birth', calculationType: 'date', spread: 3, display: 'Which of these stars is OLDER?', correct: '{cname} is {val} old', incorrect: '{cname} is {diff} older than {iname}', valueFrom: new Date()},
        { id: 'ageyng2', frequency: 1, choiceCount: 2, calculation: 'birth', calculationType: 'date', spread: 3, order: 'desc', display: 'Who is the YOUNGER star?', correct: '{cname} is {val} old', incorrect: '{iname} is {diff} older than {cname}', valueFrom: new Date()},
        { id: 'ageold4', frequency: 1, choiceCount: 4, calculation: 'birth', calculationType: 'date', spread: 5, display: 'Who is the OLDEST?',correct: '{cname} is {val} old', incorrect: '{cname} is {diff} older than {iname}', valueFrom: new Date()},
        { id: 'ageyng4', frequency: 1, choiceCount: 4, calculation: 'birth', calculationType: 'date', spread: 5, order: 'desc', display: 'Who is the YOUNGEST star?', correct: '{cname} is {val} old', incorrect: '{iname} is {diff} older than {cname}', valueFrom: new Date()},
        { id: 'acting4', frequency: 1, choiceCount: 4, calculation: 'acting', order: 'desc', minimum: 10, display: 'Who has the most ACTING credits?',correct: '{cname} has {val} acting |credits|credit', incorrect: '{cname} has {diff} more |credits than {iname}|credit than {iname}'},
        { id: 'direct4', frequency: 1, choiceCount: 4, calculation: 'directing', order: 'desc', minimum: 2, display: 'Who has DIRECTED the most?',correct: '{cname} has directed {val} |times|time', incorrect: '{cname} has directed {diff} more |times than {iname}|time than {iname}'},
        { id: 'produc4', frequency: 1, choiceCount: 4, calculation: 'producing', order: 'desc', minimum: 3, display: 'Who has the most credits as a PRODUCER?',correct: '{cname} has produced {val} |titles|title', incorrect: '{cname} has the most producing credits at {val}'},
        { id: 'acting2', frequency: 1, choiceCount: 2, calculation: 'acting', order: 'desc', spread: 50, minimum: 10, display: 'Who has ACTED in more roles?', correct: '{cname} has {val} acting |credits|credit', incorrect: '{cname} has {diff} more |credits|credit'},
        { id: 'direct2', frequency: 1, choiceCount: 2, calculation: 'directing', order: 'desc', minimum: 2, display: 'Who is the more experienced DIRECTOR?', correct: '{cname} has directed {val} |times|time', incorrect: '{cname} has sat in the big chair more often'},
        { id: 'produc2', frequency: 1, choiceCount: 2, calculation: 'producing', order: 'desc', minimum: 3, display: 'Who has worked more as a PRODUCER?', correct: '{cname} has produced {val} |titles|title', incorrect: '{cname} has produced more'},
        { id: 'direct0', frequency: 0.8, choiceCount: 3, calculation: 'directing', where: 0, spread: 10, display: 'Which of these stars has NEVER sat in the director\'s chair?', correct: '{cname} has never directed', incorrect: '{iname} has directed {ival} |times|time'},
        { id: 'produc0', frequency: 0.8, choiceCount: 3, calculation: 'producing', where: 0, spread: 10, display: 'Who has NEVER been a producer?', correct: '{cname} has never been a producer', incorrect: '{iname} has produced {ival} |titles|title'},
        { id: 'writng4', frequency: 1, choiceCount: 4, calculation: 'writing', order: 'desc', spread: 10, display: 'Who has more WRITING credits?', correct: '{cname} has {val} writing |credits|credit', incorrect: '{cname} has written {diff} |more times than {iname}|more times than {iname}'},
        { id: 'writng2', frequency: 1, choiceCount: 2, calculation: 'writing', order: 'desc', spread: 10, minimum: 1, display: 'Who is the more frequent WRITER?',correct: '{cname} has {val} writing |credits|credit', incorrect: '{iname} only has {ival} writing |credits|credit'},
        { id: 'oscrnom', frequency: 1, choiceCount: 4, calculation: 'nominations', order: 'desc', spread: 10, display: 'Who has the most Academy Award NOMINATIONS?', correct: '{cname} has {val} |nominations|nomination', incorrect: '{cname} has been nominated {val} |times|time'},
        { id: 'oscrwin', frequency: 1, choiceCount: 4, calculation: 'wins', order: 'desc', spread: 5,  minimum: 1, display: 'Who has WON the most Academy Awards?',correct: '{cname} has {val} little golden |statues|statue', incorrect: '{cname} has won {val} |oscars|oscar'},
        { id: 'oscrnvr', frequency: 0.6, choiceCount: 3, calculation: 'wins', where: 0, spread: 5, display: 'Who has NEVER won an Oscar?', correct: '{cname} has never won', incorrect: '{iname} has won {ival} |oscars|oscar'},
        { id: 'oscrhon', frequency: 0.5, choiceCount: 3, calculation: 'honorary', order: 'desc', where: 1, spread: 5, display: 'Which star has been awarded an HONORARY Academy Award?', correct: '{cname} has received an honorary Oscar', incorrect: '{iname} has not been so honored'}
    ],
    normalizeData: function(raw) {
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
    }
}
