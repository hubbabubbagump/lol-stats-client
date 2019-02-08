import React, { Component } from 'react';
import runes from './lol_data/runesReforged.json';
import spells from './lol_data/summoner.json';
import items from './lol_data/item.json';
import champions from './lol_data/champion.json';
import './App.css';

const SERVER_NAME = 'https://league-stats-battlefy.herokuapp.com';

class App extends Component {
   constructor() {
      super();

      this.state = {
         summonerName: "",
         error: false,
         loading: false,
         summonerMatchData: []
      };
   }

   handleKeyPress = (event) => {
      if (event.key === 'Enter') {
         this.setState({ error: false, loading: true, summonerMatchData: [] });
         fetch(SERVER_NAME + '/summoner?name=' + this.state.summonerName)
            .then(response => response.json())
            .then(data => this.setState({ summonerMatchData: data, loading: false }))
            .catch(error => {
               console.error(error);
               this.setState({ error: true, loading: false })
            });
      }
   }

   handleChange = (event) => {
      this.setState({ summonerName: event.target.value });
   }

   findChampion = (id) => {
      for (let champion in champions.data) {
         if (champions.data[champion].key == id) {
            return champions.data[champion];
         } 
      }
      return null;
   }

   findSpell = (id) => {
      for (let spell in spells.data) {
         if (spells.data[spell].key == id) {
            return spells.data[spell];
         }
      }
      return null;
   }

   findPrimaryRune = (styleId, perkId) => {
      for (let i = 0; i < runes.length; i++) {
         let rune = runes[i];
         if (rune.id == styleId) {
            const keystones = rune.slots[0].runes;
            for (let j = 0; j < keystones.length; j++) {
               let keystone = keystones[j];
               if (keystone.id == perkId) {
                  return keystone;
               }
            }
         }
      }
      return null;
   }

   findSubRune = (styleId) => {
      for (let i = 0; i < runes.length; i++) {
         let rune = runes[i];
         if (rune.id == styleId) {
            return rune;
         }
      }
      return null;
   }

   findItem = (id) => {
      return items.data[id];
   }

   renderMatches = () => {
      let matchData = this.state.summonerMatchData;
      let matches = [];

      for (let i = 0; i < matchData.length; i++) {
         const match = matchData[i];
         const champion = this.findChampion(match.championId);
         const matchDuration = match.gameDuration;
         const timer = Math.floor(matchDuration / 60) + ":" + ((matchDuration % 60 < 10) ? '0' + (matchDuration % 60) : matchDuration % 60);
         const spellList = [this.findSpell(match.spell1Id), this.findSpell(match.spell2Id)];
         const runeList = [this.findPrimaryRune(match.primaryPerkStyle, match.primaryPerk), this.findSubRune(match.subPerkStyle)];
         
         let itemList = [];
         for (let j = 0; j < 7; j++) {
            itemList.push(this.findItem(match['item' + j]));
         }
         itemList = itemList.filter(Boolean).map(item => <img className='sprite' key={item.image.full} src={SERVER_NAME + '/img/item/' + item.image.full} />);
         console.log(champion);
         matches.push(
            <div key={match.gameId} className={match.win ? "match victory" : "match defeat"}>
               <div className='matchStats container'>
                  <p className='victoryStatus'>{match.win ? "Victory" : "Defeat"}</p>
                  <p className='gameTimer'>{timer}</p>
               </div>
               <div className='champion container'>
                  <img src={SERVER_NAME + '/img/champion/' + champion.image.full} className='championSprite' />
                  <p className='centerText'>{champion.name}</p>
               </div>
               <div className='spells container'>
                  <div className='spells'>
                     <img src={SERVER_NAME + '/img/spell/' + spellList[0].image.full} className='sprite'/>
                     <img src={SERVER_NAME + '/img/spell/' + spellList[1].image.full} className='sprite'/>
                  </div>
                  <div className='runes'>
                     <img src={SERVER_NAME + '/img/' + runeList[0].icon} className='sprite'/>
                     <img src={SERVER_NAME + '/img/' + runeList[1].icon} className='sprite'/>
                  </div>
               </div>
               <div className='performance container'>
                  <p className='boldText'>{match.kills + ' / ' + match.deaths + ' / ' + match.assists}</p>
                  <p className='smallText'>{match.kda + ' KDA'}</p>
               </div>
               <div className='score container'>
                  <p className='smallText'>{'Level ' + match.champLevel}</p>
                  <p className='smallText'>{match.creepscore + ' cs'}</p>
                  <p className='smallText'>{match.creepscorepermin + ' cs/m'}</p>
               </div>
               <div className='items container'>
                  {itemList}
               </div>
            </div>
         );
      }

      return (
         <div className='matchlist'>{matches}</div>
      );
   }

   renderError = () => {
      return (
         <div className='errormsg'>{this.state.error ? "Error: Invalid summoner name" : ""}</div>
      );
   }

   renderLoading = () => {
      return (
         <div className={this.state.loading ? 'loader' : 'loaded'}></div>
      );
   }

   render() {
      return (
         <div className="App">
            <div id="AppContainer">
               <input type='text' autoFocus='autofocus' onKeyPress={this.handleKeyPress} onChange={this.handleChange} id="search" placeholder='Enter Summoner Name'/>
               {this.renderError()}
               {this.renderLoading()}
               {this.renderMatches()}
            </div>
         </div>
      );
   }
}

export default App;
