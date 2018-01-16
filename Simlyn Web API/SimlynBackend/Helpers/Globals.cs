using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SimlynBackend.Helpers
{
    public static class Globals
    {
        /// <summary>
        /// Cosmos DB Settings
        /// </summary>
        public static readonly string DocDBDatabaseId = "<Your Database ID>";
        public static readonly string DocDBEndpoint = "<Your Cosmos DB Endpoint Uri>";
        public static readonly string DocDBAuthKey = "<Your Doc DB Auth key>";

        /// <summary>
        /// Cosmos DB Collections used by the API
        /// </summary>
        public static readonly string DocDBCollectionHistory = "<Your Collection Name>";
    }
}