// ==UserScript==
// @name         BTN Bonus Calculations
// @namespace    https://savagecore.eu
// @version      0.1.0
// @description  Calculate estimated time until you can buy class upgrade
// @author       SavageCore
// @include      http*://broadcasthe.net/bonus.php?action=class
// @require      https://raw.githubusercontent.com/zachleat/Humane-Dates/master/humane.js
// @downloadURL  https://github.com/SavageCore/btn-bonus-calculations/raw/master/src/btn-bonus-calculations.user.js
// @grant        none
// ==/UserScript==
//
/* global document XMLHttpRequest humaneDate */

(async function () {
	'use strict';

	const rateUrl = 'https://broadcasthe.net/bonus.php?action=rate';

	const currentPoints = parseInt(document.querySelector('#pointsStats').textContent.replace(/,/g, ''), 10);
	const pointsPerDay = await getPointsPerDay();
	const table = document.querySelector('div.thin:nth-child(4) > table:nth-child(1)');

	for (let i = 0; i < table.rows.length; i++) {
		const row = table.rows[i];
		for (let j = 0; j < row.cells.length; j++) {
			const col = row.cells[j];
			if (i === 0 && col.textContent.includes('You don\'t meet the requirements!')) {
				const cost = parseInt(col.textContent.match(/(.*) Points/g)[0].replace(/^\D+|,/g, ''), 10);
				const remainingPoints = cost - currentPoints;
				const timeLeft = remainingPoints / pointsPerDay;
				const projectedDate = new Date();
				projectedDate.setDate(projectedDate.getDate() + timeLeft);
				col.title = 'Exact days left: ' + timeLeft;
				col.innerHTML = col.innerHTML.replace(/You don't meet the requirements!/, remainingPoints.toLocaleString() + ' Points remaining<br />' + humaneDate(projectedDate) + ' left');
			}
		}
	}

	async function getPointsPerDay() {
		return new Promise((resolve, reject) => {
			const req = new XMLHttpRequest();
			req.responseType = 'document';
			req.open('GET', rateUrl, true);
			req.send(null);
			req.addEventListener('load', () => {
				if (req.status === 200) {
					console.log(req);
					const dom = req.response;
					const ret = parseInt(dom.querySelector('div.box:nth-child(7) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(5)').textContent.replace(/,/g, ''), 10);
					resolve(ret);
				} else {
					reject(new Error('Unable to load bonus rate page'));
				}
			});
		});
	}
})();
