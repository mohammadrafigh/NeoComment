import { Location } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  NO_ERRORS_SCHEMA,
  OnInit,
  signal,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { Utils } from "@nativescript/core";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { shareText } from "@nativescript/social-share";

type PaymentAddress = {
  name: string;
  address: string;
  uri: string;
};

@Component({
  selector: "ns-about",
  templateUrl: "./about.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptLocalizeModule,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements OnInit {
  location = inject(Location);
  version = signal<string>(null);
  paymentAddresses = signal<PaymentAddress[]>([
    {
      name: "BTC (Lightning)",
      address: "mohammadrafigh@getalby.com",
      uri: "lightning:mohammadrafigh@getalby.com",
    },
    {
      name: "BTC",
      address: "bc1qslhfja0qhq80csuuesuqmndrmx5hwu6n0z3tsw",
      uri: "bitcoin:bc1qslhfja0qhq80csuuesuqmndrmx5hwu6n0z3tsw",
    },
    {
      name: "ETH",
      address: "0x4EE3C20A875734c8f4400cf9De78df879FD96AD7",
      uri: "ethereum:0x4EE3C20A875734c8f4400cf9De78df879FD96AD7",
    },
    {
      name: "LTC",
      address: "ltc1qn8dys7wh749cdrsxjw83zmhx5e7w8txrut50gn",
      uri: "litecoin:ltc1qn8dys7wh749cdrsxjw83zmhx5e7w8txrut50gn",
    },
    {
      name: "BCH",
      address: "bitcoincash:qr0sddp7gqvyuul5t8sj2qf30lcqkdk9eqj40avhz9",
      uri: "bitcoincash:qr0sddp7gqvyuul5t8sj2qf30lcqkdk9eqj40avhz9",
    },
    {
      name: "XMR",
      address:
        "8Aug1Nf8bar7h1mU29kMYXYU5DjWnnohkDmni3fZkoKWMRv8wJYHi2MTBrEq7VG1jrbqgAF6mAK3b12QdFMNXM7ySmSDBPJ",
      uri: "monero:8Aug1Nf8bar7h1mU29kMYXYU5DjWnnohkDmni3fZkoKWMRv8wJYHi2MTBrEq7VG1jrbqgAF6mAK3b12QdFMNXM7ySmSDBPJ",
    },
    {
      name: "ZEC",
      address:
        "u1tatygdm2y7qxajv0aeh9cmtsvvdjaharv6ysu4e9rszv3xyer32s0v6kgptuy8nfkvkl58s0s2dyhhdqdmjz2d9rxnu3t64ltup6xah2py4rmg8fjpwtjyza4jqlc2ttkdtf99umktz082w2yy7j7t5sz9mmltyy63pq5s23nappw0xvtmq437e709t5lv3u77vp0we3e6cpz7c5ur8",
      uri: "zcash:u1tatygdm2y7qxajv0aeh9cmtsvvdjaharv6ysu4e9rszv3xyer32s0v6kgptuy8nfkvkl58s0s2dyhhdqdmjz2d9rxnu3t64ltup6xah2py4rmg8fjpwtjyza4jqlc2ttkdtf99umktz082w2yy7j7t5sz9mmltyy63pq5s23nappw0xvtmq437e709t5lv3u77vp0we3e6cpz7c5ur8",
    },
    {
      name: "XEC",
      address: "ecash:qpjgpk576exggjgd6zek8z9naxvcn3eeequc58h5yy",
      uri: "ecash:qpjgpk576exggjgd6zek8z9naxvcn3eeequc58h5yy",
    },
  ]);

  ngOnInit() {
    const pi = Utils.android
      .getApplicationContext()
      .getPackageManager()
      .getPackageInfo(
        Utils.android.getApplicationContext().getPackageName(),
        0,
      );
    this.version.set(pi.versionName);
  }

  openURL(url: string) {
    return Utils.openUrl(url);
  }

  openWallet(paymentAddress: PaymentAddress) {
    if (!this.openURL(paymentAddress.uri)) {
      shareText(paymentAddress.address);
    }
  }
}
