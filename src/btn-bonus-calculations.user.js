// ==UserScript==
// @name         BTN Bonus Calculations
// @namespace    https://savagecore.uk
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
/* eslint unicorn/prefer-module: "off" */

(async function () {
	'use strict';

	const rateUrl = 'https://broadcasthe.net/bonus.php?action=rate';

	const currentPoints = Number.parseInt(document.querySelector('#pointsStats').textContent.replace(/,/g, ''), 10);
	const pointsPerDay = await getPointsPerDay();
	const table = document.querySelector('div.thin:nth-child(4) > table:nth-child(1)');

	for (let i = 0; i < table.rows.length; i++) {
		const row = table.rows[i];
		for (let j = 0; j < row.cells.length; j++) {
			const col = row.cells[j];
			if (i === 0 && col.textContent.includes('You don\'t meet the requirements!')) {
				const cost = Number.parseInt(col.textContent.match(/(.*) Points/g)[0].replace(/^\D+|,/g, ''), 10);
				const remainingPoints = cost - currentPoints;
				const timeLeft = remainingPoints / pointsPerDay;
				const projectedDate = new Date();
				projectedDate.setDate(projectedDate.getDate() + timeLeft);
				col.title = 'Exact days left: ' + timeLeft;
				col.innerHTML = remainingPoints > 0 ? col.innerHTML.replace(/You don't meet the requirements!/, remainingPoints.toLocaleString() + ' Points remaining<br />' + humaneDate(projectedDate) + ' left') : col.innerHTML.replace(/You don't meet the requirements!/, '<a href="https://broadcasthe.net/user.php?action=next_class">Click here</a> to see additional requirements');
			}
		}
	}

	async function getPointsPerDay() {
		return new Promise((resolve, reject) => {
			const request = new XMLHttpRequest();
			request.responseType = 'document';
			request.open('GET', rateUrl, true);
			request.send(null);
			request.addEventListener('load', () => {
				if (request.status === 200) {
					const dom = request.response;
					const returnValue = Number.parseInt(dom.querySelector('div.box:nth-child(7) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(5)').textContent.replace(/,/g, ''), 10);
					resolve(returnValue);
				} else {
					reject(new Error('Unable to load bonus rate page'));
				}
			});
		});
	}
})();
