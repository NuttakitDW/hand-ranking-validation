import * as fs from 'fs';
import PokerHand from 'poker-hand-evaluator';

// Function to read and parse the JSON file
const readJsonFile = (filePath: string) => {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(rawData);
    return parsedData;
};

// Read the JSON file and get the object
const jsonData = readJsonFile('data.json');

const hands = jsonData[2];
let c = 0;
for (let i = 0; i < hands.data.length; i++) {
    const data = hands.data[i]
    const handData = JSON.parse(data.hand_data);
    const handID = data.hand_history_id
    const holeCards = handData.hole_cards
    const winners = handData.summary.winners
    const board = handData.community_cards

    const player1 = holeCards[0]
    const player2 = holeCards[1]

    if (board.length != 5) {
        continue;
    }
    if (holeCards.length != 2) {
        continue;
    }
    if (winners.length != 1) {
        continue;
    }
    let isFold = false
    for (let j = 0; j < handData.actions.length; j++) {
        let detail = handData.actions[j].details
        if (detail == "folds") {
            isFold = true
        }
    }
    if (isFold) {
        continue;
    }
    // get player best combination
    const player1Cards = player1.cards;
    const player2Cards = player2.cards;
    const combinations1 = getCombinations(player1Cards, board);
    const bestComb1 = getBestComb(combinations1);
    const combinations2 = getCombinations(player2Cards, board);
    const bestComb2 = getBestComb(combinations2);

    // player PokerHand instances
    const player1Hand = new PokerHand(bestComb1);
    const player2Hand = new PokerHand(bestComb2);

    // compare player hands
    const result = player1Hand.compareWith(player2Hand);
    const winner = winners[0];


    // if result === 1 check if winners.user_id == player1.user_i
    if (result === 1) {
        if (winner.user_id != player1.user_id) {
            console.log("Error: Winner is not player 1")
            console.log("Hand ID: ", handID);
            console.log("Hole Cards: ", holeCards);
            console.log("Winners: ", winners);
            console.log("Board: ", board);
            console.log("Player 1: ", player1);
            console.log("Rank: ", player1Hand.getRank());
            console.log("Player 2: ", player2);
            console.log("Rank: ", player2Hand.getRank());
            console.log("---------------------------------------------------");
        }
    } else if (result === 2) {
        if (winner.user_id != player2.user_id) {
            console.log("Error: Winner is not player 2")
            console.log("Hand ID: ", handID);
            console.log("Hole Cards: ", holeCards);
            console.log("Winners: ", winners);
            console.log("Board: ", board);
            console.log("Player 1: ", player1);
            console.log("Rank: ", player1Hand.getRank());
            console.log("Player 2: ", player2);
            console.log("Rank: ", player2Hand.getRank());
            console.log("---------------------------------------------------");
        }
    } else {
        console.log("later")
    }
}

// Function to get all combinations of 5 cards from player cards and community cards
function getCombinations(playerCards: string[], board: string[]): string[] {
    const allCards = [...playerCards, ...board];  // Combine player cards and community cards
    const combinations: string[] = [];

    // Generate all combinations of 5 cards
    for (let i = 0; i < allCards.length; i++) {
        for (let j = i + 1; j < allCards.length; j++) {
            for (let k = j + 1; k < allCards.length; k++) {
                for (let l = k + 1; l < allCards.length; l++) {
                    for (let m = l + 1; m < allCards.length; m++) {
                        combinations.push([allCards[i], allCards[j], allCards[k], allCards[l], allCards[m]].join(' '));
                    }
                }
            }
        }
    }

    return combinations;
}

function getBestComb(combinations: string[]) {
    let bestComb = '';
    let bestScore = 999999999;
    for (let i = 0; i < combinations.length; i++) {
        const hand = new PokerHand(combinations[i]);
        const score = hand.getScore();
        if (score < bestScore) {
            bestScore = score;
            bestComb = combinations[i];
        }
    }
    return bestComb;
}
