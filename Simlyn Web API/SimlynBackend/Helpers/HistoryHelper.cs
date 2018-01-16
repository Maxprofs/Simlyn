using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using SimlynBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SimlynBackend.Helpers
{
    public class HistoryHelper
    {
        private DocumentClient client;
        private Uri collectionUri;

        public HistoryHelper()
        {
            this.client = new DocumentClient(new Uri(Globals.DocDBEndpoint), Globals.DocDBAuthKey);
            this.collectionUri = UriFactory.CreateDocumentCollectionUri(Globals.DocDBDatabaseId, Globals.DocDBCollectionHistory);
        }

        /// <summary>
        /// Returns all HighFacts
        /// </summary>
        /// <returns></returns>
        public List<Flashdata> GetHistoryItems()
        {
            FeedOptions queryOptions = new FeedOptions { MaxItemCount = -1 };
            List<Flashdata> HistoryItems = new List<Flashdata>();

            IQueryable<Flashdata> historyQuery = this.client.CreateDocumentQuery<Flashdata>(this.collectionUri, queryOptions);

            foreach (Flashdata _flashdata in historyQuery)
            {
                HistoryItems.Add(new Flashdata {
                    Amount = _flashdata.Amount,
                    DateTime = _flashdata.DateTime,
                    ReceiverAddress = _flashdata.ReceiverAddress,
                    Message = _flashdata.Message,
                    Coordinates = _flashdata.Coordinates
                });
            }

            return HistoryItems;
        }

        /// <summary>
        /// Creates a History Item
        /// </summary>
        /// <param name="Flashdata"></param>
        /// <returns>The created History Document</returns>
        public async Task<Document> CreateHistoryItem(Flashdata flashdata)
        {
            return await client.CreateDocumentAsync(this.collectionUri, flashdata);
        }
    }
}
