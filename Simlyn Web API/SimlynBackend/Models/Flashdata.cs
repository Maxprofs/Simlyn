using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SimlynBackend.Models
{
    public class Flashdata
    {
        [JsonProperty(PropertyName = "message")]
        public String Message { get; set; }

        [JsonProperty(PropertyName = "amount")]
        public int Amount { get; set; }

        [JsonProperty(PropertyName = "datetime")]
        public String DateTime { get; set; }

        [JsonProperty(PropertyName = "receiveraddress")]
        public String ReceiverAddress { get; set; }

        [JsonProperty(PropertyName = "coordinates")]
        public String Coordinates { get; set; }
    }
}
