
import {
  User,
  TransactionRequestStatus,
  TransactionStatus,
} from "../../../src/models";
import { addDays, isWithinInterval, startOfDay } from "date-fns";
import { startOfDayUTC, endOfDayUTC } from "../../../src/utils/transactionUtils";


const { _ } = Cypress;

describe("Transaction Test", function () {
  const ctx = {};

  const feedViews = {

    personal: {
      tab: "personal-tab",
      tabLabel: "mine",
      routeAlias: "personalTransactions",
      service: "personalTransactionService",
    },
  };

  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/notifications").as("notifications");
    cy.intercept("GET", "/transactions*").as(feedViews.personal.routeAlias);


    cy.database("filter", "users").then((users) => {
      ctx.user = users[0];
      ctx.allUsers = users;

      cy.loginByXstate(ctx.user.username);
    });
  });


  describe("renders and paginates all transaction feeds", function () {
    it("renders transactions item variations in feed", function () {
      // Visit page again to trigger call to /transactions/public
      cy.visit("/");

      cy.wait("@notifications");
    });

    _.each(feedViews, (feed, feedName) => {
      it(`paginates ${feedName} transaction feed`, function () {
        cy.getBySelLike(feed.tab)
          .click()
          .should("have.class", "Mui-selected")
          .contains(feed.tabLabel, { matchCase: false })
          .should("have.css", { "text-transform": "uppercase" });
        cy.getBySel("list-skeleton").should("not.exist");
        cy.visualSnapshot(`Paginate ${feedName}`);

        cy.wait(`@${feed.routeAlias}`)
          .its("response.body.results")
          .should("have.length", Cypress.env("paginationPageSize"));


        cy.log("Scroll to next page");
        cy.getBySel("transaction-list").children().scrollTo("bottom");

        cy.wait(`@${feed.routeAlias}`)
          .its("response.body")
          .then(({ results, pageData }) => {
            expect(results).have.length(Cypress.env("paginationPageSize"));
            expect(pageData.page).to.equal(2);
            cy.visualSnapshot(`Paginate ${feedName} Next Page`);
            cy.nextTransactionFeedPage(feed.service, pageData.totalPages);
          });

        cy.wait(`@${feed.routeAlias}`)
          .its("response.body")
          .then(({ results, pageData }) => {
            expect(results).to.have.length.least(1);
            expect(pageData.page).to.equal(pageData.totalPages);
            expect(pageData.hasNextPages).to.equal(false);
            cy.visualSnapshot(`Paginate ${feedName} Last Page`);
          });
      });
    });
  });

  describe("filters transaction feeds by date range", function () {

    _.each(feedViews, (feed, feedName) => {
      it(`filters ${feedName} transaction feed by date range`, function () {
        cy.database("find", "transactions").then((transaction) => {
          const dateRangeStart = startOfDay(new Date(transaction.createdAt));
          const dateRangeEnd = endOfDayUTC(addDays(dateRangeStart, 1));

          cy.getBySelLike(feed.tab).click().should("have.class", "Mui-selected");

          cy.wait(`@${feed.routeAlias}`).its("response.body.results").as("unfilteredResults");

          cy.pickDateRange(dateRangeStart, dateRangeEnd);

          cy.wait(`@${feed.routeAlias}`)
            .its("response.body.results")
            .then((transactions) => {
              cy.getBySelLike("transaction-item").should("have.length", transactions.length);

              transactions.forEach(({ createdAt }) => {
                const createdAtDate = startOfDayUTC(new Date(createdAt));

                expect(
                  isWithinInterval(createdAtDate, {
                    start: startOfDayUTC(dateRangeStart),
                    end: dateRangeEnd,
                  }),
                  `transaction created date (${createdAtDate.toISOString()}) 
                  is within ${dateRangeStart.toISOString()} 
                  and ${dateRangeEnd.toISOString()}`
                ).to.equal(true);
              });

              cy.visualSnapshot("Date Range Filtered Transactions");
            });

          cy.log("Clearing date range filter. Data set should revert");
          cy.getBySelLike("filter-date-clear-button").click({
            force: true,
          });
          cy.getBySelLike("filter-date-range-button").should("contain", "ALL");

          cy.get("@unfilteredResults").then((unfilteredResults) => {
            cy.wait(`@${feed.routeAlias}`)
              .its("response.body.results")
              .should("deep.equal", unfilteredResults);
            cy.visualSnapshot("Unfiltered Transactions");
          });
        });
      });

      it(`does not show ${feedName} transactions for out of range date limits`, function () {
        const dateRangeStart = startOfDay(new Date(2014, 1, 1));
        const dateRangeEnd = endOfDayUTC(addDays(dateRangeStart, 1));

        cy.getBySelLike(feed.tab).click();
        cy.wait(`@${feed.routeAlias}`);

        cy.pickDateRange(dateRangeStart, dateRangeEnd);
        cy.wait(`@${feed.routeAlias}`);

        cy.getBySelLike("transaction-item").should("have.length", 0);
        cy.getBySel("empty-list-header").should("contain", "No Transactions");
        cy.getBySelLike("empty-create-transaction-button")
          .should("have.attr", "href", "/transaction/new")
          .contains("create a transaction", { matchCase: false })
          .should("have.css", { "text-transform": "uppercase" });
        cy.visualSnapshot("No Transactions");
      });
    });
  });

  describe("filters transaction feeds by amount range", function () {
    const dollarAmountRange = {
      min: 200,
      max: 800,
    };

    _.each(feedViews, (feed, feedName) => {
      it(`filters ${feedName} transaction feed by amount range`, function () {
        cy.getBySelLike(feed.tab).click({ force: true }).should("have.class", "Mui-selected");

        cy.wait(`@${feed.routeAlias}`).its("response.body.results").as("unfilteredResults");

        cy.setTransactionAmountRange(dollarAmountRange.min, dollarAmountRange.max);

        cy.getBySelLike("filter-amount-range-text").should(
          "contain",
          `$${dollarAmountRange.min} - $${dollarAmountRange.max}`
        );

        cy.wait(`@${feed.routeAlias}`).then(({ response: { body, url } }) => {
          const transactions = body.results;
          const urlParams = new URLSearchParams(_.last(url.split("?")));

          const rawAmountMin = dollarAmountRange.min * 100;
          const rawAmountMax = dollarAmountRange.max * 100;

          expect(urlParams.get("amountMin")).to.equal(`${rawAmountMin}`);
          expect(urlParams.get("amountMax")).to.equal(`${rawAmountMax}`);

          cy.visualSnapshot("Amount Range Filtered Transactions");
          transactions.forEach(({ amount }) => {
            expect(amount).to.be.within(rawAmountMin, rawAmountMax);
          });
        });

        cy.getBySelLike("amount-clear-button").click();


        cy.get("@unfilteredResults").then((unfilteredResults) => {
          cy.wait(`@${feed.routeAlias}`)
            .its("response.body.results")
            .should("deep.equal", unfilteredResults);
          cy.visualSnapshot("Unfiltered Transactions");
        });
      });

      it(`does not show ${feedName} transactions for out of range amount limits`, function () {
        cy.getBySelLike(feed.tab).click();
        cy.wait(`@${feed.routeAlias}`);

        cy.setTransactionAmountRange(550, 1000);
        cy.getBySelLike("filter-amount-range-text").should("contain", "$550 - $1,000");
        cy.wait(`@${feed.routeAlias}`);

        cy.getBySelLike("transaction-item").should("have.length", 0);
        cy.getBySel("empty-list-header").should("contain", "No Transactions");
        cy.getBySelLike("empty-create-transaction-button")
          .should("have.attr", "href", "/transaction/new")
          .contains("create a transaction", { matchCase: false })
          .should("have.css", { "text-transform": "uppercase" });
        cy.visualSnapshot("No Transactions");
      });
    });
  });

    it("personal transactions", function () {
      cy.getBySelLike(feedViews.personal.tab).click();

      cy.wait("@personalTransactions")
        .its("response.body.results")
        .each((transaction) => {
          const transactionParticipants = [transaction.senderId, transaction.receiverId];
          expect(transactionParticipants).to.include(ctx.user.id);
        });
      cy.getBySel("list-skeleton").should("not.exist");
      cy.visualSnapshot("Personal Transactions");
    });

  
});
