var movieQuestions = {
    questionTypes: [
        { id: 'relfst2', frequency: 1, choiceCount: 2, calculation: 'release', calculationType: 'date', spread: 3, display: 'Which film was released FIRST?', correct: '{cname} was released in {val}', incorrect: '{cname} came out {diff} before {iname}'},
        { id: 'rellst2', frequency: 1, choiceCount: 2, calculation: 'release', calculationType: 'date', spread: 3, order: 'desc', display: 'Which is the NEWER movie?', correct: '{cname} is a {val} film', incorrect: '{iname} was released first'},
        { id: 'relfst4', frequency: 1, choiceCount: 4, calculation: 'release', calculationType: 'date', spread: 5, display: 'Which movie came out FIRST?',correct: '{cname} came out in {val}', incorrect: '{cname} was released {diff} earlier than {iname}'},
        { id: 'rellst4', frequency: 1, choiceCount: 4, calculation: 'release', calculationType: 'date', spread: 5, order: 'desc', display: 'Which is the most RECENT film?', correct: '{cname} came out in {val}', incorrect: '{cname} came out {diff} after {iname}'},
        { id: 'boxdom4', frequency: 1, choiceCount: 4, calculation: 'domestic', calculationType: 'currency', order: 'desc', minimum: 10000000, spread: 300000000, display: 'Which made the most at the DOMESTIC box office?', correct: '{cname} made {val} domestically', incorrect: '{cname} made {diff} more than {iname}'},
        { id: 'boxwld4', frequency: 1, choiceCount: 4, calculation: 'worldwide', calculationType: 'currency', order: 'desc', minimum: 50000000, spread: 1000000000, display: 'What film grossed the most WORLD-WIDE?',correct: '{cname} made {val} world-wide', incorrect: '{cname} made {diff} more than {iname} world-wide'},
        { id: 'boxdom2', frequency: 1, choiceCount: 2, calculation: 'domestic', calculationType: 'currency', order: 'desc', minimum: 10000000, spread: 300000000, display: 'What film grossed more DOMESTICALLY?', correct: '{cname} made {val}', incorrect: '{cname} made {diff} more'},
        { id: 'boxwld2', frequency: 1, choiceCount: 2, calculation: 'worldwide', calculationType: 'currency', order: 'desc', minimum: 10000000, spread: 300000000, display: 'What film grossed more WORLD-WIDE?', correct: '{cname} grossed {val} worldwide', incorrect: '{iname} only made {ival} worldwide'},
        { id: 'pcostm4', frequency: 1, choiceCount: 4, calculation: 'cost', calculationType: 'currency', order: 'desc', spread: 50000000, display: 'Which is the most EXPENSIVE film?', correct: '{cname} cost {val} to make', incorrect: '{cname} cost {diff} more than {iname}'},
        { id: 'pcostl4', frequency: 1, choiceCount: 4, calculation: 'cost', calculationType: 'currency', spread: 50000000, display: 'Which had the LOWEST budget?', correct: '{cname} was made for {val}', incorrect: '{iname} cost {diff} more than {cname}'},
        { id: 'cscore2', frequency: 1, choiceCount: 2, calculation: 'criticScore', order: 'desc', spread: 40, display: 'Which film has he HIGHER Tomatometer score?', correct: '{cname} has a score of {val}%', incorrect: '{iname} only scored {ival}%'},
        { id: 'ascore2', frequency: 1, choiceCount: 2, calculation: 'audienceScore', order: 'desc', spread: 40, display: 'Which film has he higher AUDIENCE score on Rotten Tomatoes?', correct: '{cname} has a score of {val}%', incorrect: '{iname} only scored {ival}%'},
        { id: 'boxnet2', frequency: 1, choiceCount: 2, calculation: 'profit', calculationType: 'currency', order: 'desc', spread: 50000000, minimum: 5000000, display: 'Which film was more PROFITABLE?',correct: 'recepits for {cname} exceeded costs by {val}', incorrect: '{iname} was {diff} less profitable'},
        { id: 'boxnet0', frequency: 0.5, choiceCount: 4, calculation: 'profit', calculationType: 'currency', order: 'desc', spread: 100000000, where: 0, display: 'Which film FAILED to make money?', correct: '{cname} was a box office bust', incorrect: '{iname} actually made {ival}'},
        { id: 'oscrwin', frequency: 1, choiceCount: 4, calculation: 'wins', order: 'desc', spread: 5, display: 'Which movie boasts the most Academy Award WINS?',correct: '{cname} won a total of {val} |oscars|oscar', incorrect: '{cname} won {val} more |oscars than {iname}|oscar than {iname}'},
        { id: 'oscrnom', frequency: 1, choiceCount: 3, calculation: 'nominations', order: 'desc', minimum: 1, spread: 8, display: 'Which film had the most Academy Award NOMINATIONS?', correct: '{cname} was nominated {val} times', incorrect: '{cname} was nominated for {diff} more \awards|award'}
    ],
    normalizeData: function(raw) {
        return raw.map(function(datum) {
            return {
                id: datum.name.toLowerCase().split(' ').join('').split('\'').join('').split('.').join('') + new Date(datum.release).getFullYear(),
                name: datum.name,
                release: new Date(datum.release),
                releaseYear: new Date(datum.release).getFullYear(),
                domestic: datum.boxoffice.domestic,
                worldwide: datum.boxoffice.worldwide,
                cost: datum.boxoffice.cost,
                profit: datum.boxoffice.domestic > datum.boxoffice.cost ? (datum.boxoffice.domestic - datum.boxoffice.cost) : 0,
                wins: datum.oscars.wins,
                nominations: datum.oscars.nominations,
                criticScore: datum.rt.criticScore,
                audienceScore: datum.rt.audienceScore,
                image: datum.image
            };
        });
    }
}
