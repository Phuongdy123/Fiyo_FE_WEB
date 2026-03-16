'use client';
import { useRouter } from 'next/navigation';

export default function CollectionSlider() {
  const router = useRouter();

  const handleClick = (id: string) => {
    router.push(`/page/collection/${id}`);
  };

  return (
    <div className="collections">
      <div className="slick-slide" onClick={() => handleClick('64f0d0008f1e7e001234568f')}>
        <img
          src="https://2885371169.e.cdneverest.net/media/Simiconnector/Nu-spMoi-05Mar.webp"
          alt="Nữ"
        />
      </div>

      <div className="slick-slide" onClick={() => handleClick('64f0d0008f1e7e0012345680')}>
        <img
          src="https://lh3.googleusercontent.com/rd-gg-dl/AOI_d_-in9fOo--I2SJEyMnL9Bn6oMrF3NjLLOrAxnv6dyV-zZ30YvPH8bbjyioH9HU0mhDbzbvuA1IK84VF4w3aD5VtlxdvlXxclM-IhjMLCOikVS7WSzj8nDaZB90nhr9bhU3BJJ1obYVuDXDoKXIXGe0u6jDaplzY_NdOtMEHDpVS7fj1Yxoneqd-7tnpob6Sr0-rfek8E_KQLP3JA9dJVr8-C03IQu0lFbVX0qiXbKGggsparccINgjEnl2UF54EIIDW0UfymfOjDGLna2jWIQ51_B3-VVc96vQCMK518HG4G1zdxEdw2O60elpm2ZK3EziKtCQOxnzgB_5WKudmn5oAdk4mCIgcIxyinl7leHhkIwzQJ0J-58oqnsy--gqnU7AdTIRHshLnPrZ5eFyh8MmSZ2H4pkiR-qTFn1Hp8O7HMC_B--jkj2ARrp2A42HaeCzkMx4WWhPNF-27WCPzQtTLtp4JOKhRqJmUqzk5eI-Mw80i03ZilLUGvUkrXgrRpB4BluQme4niziHRv0X5nYhqpZRfV00C9vLJsNOybFmSR5TxSYQyYZqwnk3NYKLWOnFHe2YhPIKMWIut-JLkoZOjml6Eei9yn974M2ulBa8Y3VB4J4SFPYejW04unKBfz6o3vqckU6T3jZbQ5m4tKxx_tJijWrV9odivOMQ_94mSzl5IMjwjnnzQXZDiQ7n98Lhn5gbg54VBv-emzVIk6HSTZNvbyRf7Et4I6vZ-cdUZNBqEQNZBIEVtGUTd2OW21skXWiLEelifTv2gvkvPPAFUXXPlALnfOGrPwKGEy66ULKV7Fq517gdzowkHsRAJyXSHjea3miDl_VXJLEk-f7IH4hrS2dZ3_i68ypmIejYDFu61mElde2NkkX01JVJeLWPg3z_c-QjVCUbSuc77qVnBE3fod3gSewogSeBFojS7zoriT4b8K85ENFA4oPldNe0yugMlBCUrqQn99Bvg-Nli-Li8LswwqLj-LyqhnjG1_nAeNmvPYeki6PnIFsPQd0co8As89m-StFqz3WA-bQ-BuREgIeHgyIg-jd51_ybugXfphooPed9VuyDQ5kodXKU_DhFMVv5mWmzwyBPotJdITP3stYmnGqEUUdQ2oOdowkFjov4SmLpfpoKSW7_o5rUitLOj7jaLA7CF0UmNwkJUhgc7SlMUlb8WhhUeZILb9YZIT1CaNQ1ib1gFyRwV1vAyGEp6SeFbrrtUBzKWZ0I=s1600-rj"
          alt="Nam"
        />
      </div>

      <div className="slick-slide" onClick={() => handleClick('64f0c0008f1e7e0012345678')}>
        <img
          src="https://2885371169.e.cdneverest.net/media/Simiconnector/BG-07Mar.webp"
          alt="Bé gái"
        />
      </div>

      <div className="slick-slide" onClick={() => handleClick('64f0d0008f1e7e0012345671')}>
        <img
          src="https://lh3.googleusercontent.com/gg-dl/AOI_d_9X4_pTH18CClgwbWne3rggQSH7KaMue97Y5q9D9CgVQQBTTXjWASbbCZb671jVkPuNYWy7hfLJNH1g0A-OJFF3nNPbTf0sfdrUt24m-nFMsVSRjA5nwGhp5Sf_eHoGB95At78SZgH7OzO_2ot2mfpOOZySpGPBh_TblXLq4O7AjWIq=s1600-rj"
          alt="Bé trai"
        />
      </div>
    </div>
  );
}
