import nock from 'nock';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  EMS_VERIFICATION_WEBSITE_BASE_URL,
  EMS_VERIFICATION_WEBSITE_PATH,
} from '../../../helpers/license/verifyLicense.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function mockLicenseVerificationWebsite () {
  nock(EMS_VERIFICATION_WEBSITE_BASE_URL)
    .get(EMS_VERIFICATION_WEBSITE_PATH)
    .replyWithFile(
      200,
      path.resolve(__dirname, 'nockLicenseVerificationWebsite.get.html'),
      {
        'Set-Cookie':
          'ASP.NET_SessionId=5dmsvekk2qnjkneee0rx3oam; path=/; secure; HttpOnly; SameSite=Lax',
      }
    );

  nock(EMS_VERIFICATION_WEBSITE_BASE_URL)
    .post(
      EMS_VERIFICATION_WEBSITE_PATH,
      't_web_lookup__license_no=P39332&__VIEWSTATE=%2FwEPDwUJNzM2NTgwNzkyD2QWAgIBD2QWAmYPZBYCAgEPZBYCAgEPZBYCAgEPZBYGAgMPZBYCAgEPZBYCZg8QZGQWAWZkAgQPZBYCAgEPZBYCZg8QZGQWAWZkAgoPZBYCAgEPZBYCZg8QZGQWAWZkZOPA819c1SnM%2BHDfV9ANb280uL%2F25SvJ4MzWuRfO72pi&__EVENTVALIDATION=%2FwEdAGfZSxxij%2BTdpoEgDD0DiLPjjy2ngDzgA2SYENL8cE218WSJwzvf%2Ff8RGMUb1EXE%2FfVF%2BJNRdlehFeGsHxBInlU61AIUzdMPlD4%2FkX4IKYnt%2BD9O4Hvf6KWMuZPzLxSB7QqfDUzJE%2F3jKyLsTofI21GgMNDEoylHkEUJXRO0mzGtQzMC7OFJNK20maW82PC2uY9lDhftt4I%2BRAyT37NbCGcv%2BSZXeDwIgQGMGgFr43EUrSvMcVivNIh2Fq6%2FopalWntVTp7vI0DC5JzNilmvM7rfTl3LgdFPVXkkP026aWTJph3FhvxYPpKsgjiznhr4ofXIf3DiJB4FIv%2BKTwsWfi1J%2BanPF%2Fquv%2Fip0W%2BHfi17M8OfigV%2Bqj349a2cvHQRqAHsGa5ZqawVWZOswasGWi%2BZXaJ4hA0rgAyidMTPiBA%2B4z6Myd86hqUvEjzYUDVSaRQ2vzV0joD9tbBT5qYfsA%2FMy8pvXcuJd5U7D6DzXu4c0sQnP2Po9eNlSxLiOqiQYREzqCtGmpdG52kQ1pORp1ucjx2fNeRqb0JFehGLYvRWTKghWiRPmdWPBLxJktTnYq7XEXX41dYsSuBO3bHwXUoo4tNcU3rz2%2BauvScBJniIg%2BwjFLkguzLXY2QW6NndmqUQP8GuwU1erxh8pqShUJziMWvujdLfBwR1MiaH2Pw2m1jqMkwrG%2BhsNplrexJcWmHiwTQn1XSVLw5vBkC2LKPMkYsmIfIUgphSOIaPv0aoXNfy2fp35RpRBXS0IgQnk2rj2uv8UBiwxYtJOqmnZrzvM4wpxN08BdSiwvtNK2%2FpqaJxLoa02kTl3GR%2FSnsNHqq9kMlN0cEVkWSGXLIj6n54DS7op2BJtvoxEn3u%2FRj2JhrvnlVEVo8zg%2BTo4j3gDsZAGsxTI%2FRh1vyA6AabD26dmwyXGTKPlStsIQV%2Fx%2BcULtcfcZlGKTovH0ArfoWEixVgIvaQVN8fUZxm71Rwn09gNB80PUBnaxMpUBRiF5G1Bjz4c8wEo1ADUXEm5IyZVCVGOBmKERuA%2FuVaXz%2Fgts1DE1nXGua%2B6p5XakaoKe5%2B0g6j0ox1PET1gNR3CbZaePxxZm3nZ88%2BvfliaIqEgWEykpNWx75a1ezjc03Ft%2BIzPaCtr4yvCrTI%2BmvbosBiXQVEhFQ2RnfJ37LrswZsClndbIdjHZH%2BBzDgRxhWxHLbXMvHhLtKjKVpiYF52%2Bl5gYIA7Fm4zef5fnvLsJ2HZowD4IGgmxz6qzYsFtQkJkkHnJ0wP5zjTqipmAKjsg6Cb28ULfK3p1ydT12w83RzOHU6zNZ6l9vzlPOI%2BhtWRMsaKCbCAZKySratVomxl9JjR8FzacjDG08UIwTg%2BoOmeuigHzusNJasJCM3hMo9AkDJhxB07djoP8VqQynEVR764YR7VgIVSgOC9%2BVRq2SFez7XsfipmhoyhtL5dawY%2Fg%2Bp5qXqwGWa3VAuwt0f8BML8HacRP1TMYkbCK6VSwtPLgndeSAUXHCGI%2F9oLnnV0SZMMaqAlv20ChK8xvTnKbOxhCye4D1x0BXxjA%2FbS%2FmsGqqZ%2BlrsuvnyxtPjV0brURzsv%2Fm8dz5KagE0CN3kjPHc4IfVswH%2FuV9EqX7ym96K6hFmcXq5QO7hSoR27i%2F3Ago6eI%2FyCnEZ0L%2FL2ag6sWTX0YOhHi2QFtM42cRz6Ja0%2BKIsI0lZ%2BIBENdDGEdmJYJtwRIxBFVweMGrvNQmR%2F%2F3cyAn4ecymoEksV4WANoLAp5g%2FizcpAA74XwIaAGgNreXl1GhgEwiBSf0uUzAiXeWtm%2FqcxHCFscFfi%2BRAUulMRIYcJCoTaz%2B5WZHvGYtRnXyB3%2B9xOt0EuqbxWQw%2F95f5WOqiF%2BIE1A%2FaZ%2BzYh%2FkusLQThShUNdaZXIxJW1Zl0KyWYQqDzgUYYUCuyAx8UyhSK43Hg7rtY4XVlbInCwwzNlviERUN85ba5MWx9zRYYN%2B9rOhximkt0FCrkHrPySL1nn1lnRqLL1qbVNQLLRYfoOLrk%2BvdvZPGofJXK0i25ifJN1Q%2BOlJzqBuszVVvoSrRltUvieOkgVAaAZaH%2FVPTE92YgqkGaokh0uslMvHgpgx8D8cO0HMTqEjyS%2Fm1YAlaFKTnQc%2BA8S4zFmYuRdDqIEpI%2BASdxUwQ9Vdq2RLaBkXn7g70IjUW5jmSeFFFgdsIAbJmdMpKnFiDikb9LuNH%2F9sJRqLNRcRoadE3UKEG4TSeD2d%2FxfZgTRHvbeRTDEBgwNI%3D&sch_button=Search'
    )
    .replyWithFile(
      200,
      path.resolve(__dirname, 'nockLicenseVerificationWebsite.post.valid.html')
    );

  nock(EMS_VERIFICATION_WEBSITE_BASE_URL)
    .post(
      EMS_VERIFICATION_WEBSITE_PATH,
      't_web_lookup__license_no=1&__VIEWSTATE=%2FwEPDwUJNzM2NTgwNzkyD2QWAgIBD2QWAmYPZBYCAgEPZBYCAgEPZBYCAgEPZBYGAgMPZBYCAgEPZBYCZg8QZGQWAWZkAgQPZBYCAgEPZBYCZg8QZGQWAWZkAgoPZBYCAgEPZBYCZg8QZGQWAWZkZOPA819c1SnM%2BHDfV9ANb280uL%2F25SvJ4MzWuRfO72pi&__EVENTVALIDATION=%2FwEdAGfZSxxij%2BTdpoEgDD0DiLPjjy2ngDzgA2SYENL8cE218WSJwzvf%2Ff8RGMUb1EXE%2FfVF%2BJNRdlehFeGsHxBInlU61AIUzdMPlD4%2FkX4IKYnt%2BD9O4Hvf6KWMuZPzLxSB7QqfDUzJE%2F3jKyLsTofI21GgMNDEoylHkEUJXRO0mzGtQzMC7OFJNK20maW82PC2uY9lDhftt4I%2BRAyT37NbCGcv%2BSZXeDwIgQGMGgFr43EUrSvMcVivNIh2Fq6%2FopalWntVTp7vI0DC5JzNilmvM7rfTl3LgdFPVXkkP026aWTJph3FhvxYPpKsgjiznhr4ofXIf3DiJB4FIv%2BKTwsWfi1J%2BanPF%2Fquv%2Fip0W%2BHfi17M8OfigV%2Bqj349a2cvHQRqAHsGa5ZqawVWZOswasGWi%2BZXaJ4hA0rgAyidMTPiBA%2B4z6Myd86hqUvEjzYUDVSaRQ2vzV0joD9tbBT5qYfsA%2FMy8pvXcuJd5U7D6DzXu4c0sQnP2Po9eNlSxLiOqiQYREzqCtGmpdG52kQ1pORp1ucjx2fNeRqb0JFehGLYvRWTKghWiRPmdWPBLxJktTnYq7XEXX41dYsSuBO3bHwXUoo4tNcU3rz2%2BauvScBJniIg%2BwjFLkguzLXY2QW6NndmqUQP8GuwU1erxh8pqShUJziMWvujdLfBwR1MiaH2Pw2m1jqMkwrG%2BhsNplrexJcWmHiwTQn1XSVLw5vBkC2LKPMkYsmIfIUgphSOIaPv0aoXNfy2fp35RpRBXS0IgQnk2rj2uv8UBiwxYtJOqmnZrzvM4wpxN08BdSiwvtNK2%2FpqaJxLoa02kTl3GR%2FSnsNHqq9kMlN0cEVkWSGXLIj6n54DS7op2BJtvoxEn3u%2FRj2JhrvnlVEVo8zg%2BTo4j3gDsZAGsxTI%2FRh1vyA6AabD26dmwyXGTKPlStsIQV%2Fx%2BcULtcfcZlGKTovH0ArfoWEixVgIvaQVN8fUZxm71Rwn09gNB80PUBnaxMpUBRiF5G1Bjz4c8wEo1ADUXEm5IyZVCVGOBmKERuA%2FuVaXz%2Fgts1DE1nXGua%2B6p5XakaoKe5%2B0g6j0ox1PET1gNR3CbZaePxxZm3nZ88%2BvfliaIqEgWEykpNWx75a1ezjc03Ft%2BIzPaCtr4yvCrTI%2BmvbosBiXQVEhFQ2RnfJ37LrswZsClndbIdjHZH%2BBzDgRxhWxHLbXMvHhLtKjKVpiYF52%2Bl5gYIA7Fm4zef5fnvLsJ2HZowD4IGgmxz6qzYsFtQkJkkHnJ0wP5zjTqipmAKjsg6Cb28ULfK3p1ydT12w83RzOHU6zNZ6l9vzlPOI%2BhtWRMsaKCbCAZKySratVomxl9JjR8FzacjDG08UIwTg%2BoOmeuigHzusNJasJCM3hMo9AkDJhxB07djoP8VqQynEVR764YR7VgIVSgOC9%2BVRq2SFez7XsfipmhoyhtL5dawY%2Fg%2Bp5qXqwGWa3VAuwt0f8BML8HacRP1TMYkbCK6VSwtPLgndeSAUXHCGI%2F9oLnnV0SZMMaqAlv20ChK8xvTnKbOxhCye4D1x0BXxjA%2FbS%2FmsGqqZ%2BlrsuvnyxtPjV0brURzsv%2Fm8dz5KagE0CN3kjPHc4IfVswH%2FuV9EqX7ym96K6hFmcXq5QO7hSoR27i%2F3Ago6eI%2FyCnEZ0L%2FL2ag6sWTX0YOhHi2QFtM42cRz6Ja0%2BKIsI0lZ%2BIBENdDGEdmJYJtwRIxBFVweMGrvNQmR%2F%2F3cyAn4ecymoEksV4WANoLAp5g%2FizcpAA74XwIaAGgNreXl1GhgEwiBSf0uUzAiXeWtm%2FqcxHCFscFfi%2BRAUulMRIYcJCoTaz%2B5WZHvGYtRnXyB3%2B9xOt0EuqbxWQw%2F95f5WOqiF%2BIE1A%2FaZ%2BzYh%2FkusLQThShUNdaZXIxJW1Zl0KyWYQqDzgUYYUCuyAx8UyhSK43Hg7rtY4XVlbInCwwzNlviERUN85ba5MWx9zRYYN%2B9rOhximkt0FCrkHrPySL1nn1lnRqLL1qbVNQLLRYfoOLrk%2BvdvZPGofJXK0i25ifJN1Q%2BOlJzqBuszVVvoSrRltUvieOkgVAaAZaH%2FVPTE92YgqkGaokh0uslMvHgpgx8D8cO0HMTqEjyS%2Fm1YAlaFKTnQc%2BA8S4zFmYuRdDqIEpI%2BASdxUwQ9Vdq2RLaBkXn7g70IjUW5jmSeFFFgdsIAbJmdMpKnFiDikb9LuNH%2F9sJRqLNRcRoadE3UKEG4TSeD2d%2FxfZgTRHvbeRTDEBgwNI%3D&sch_button=Search'
    )
    .replyWithFile(
      200,
      path.resolve(
        __dirname,
        'nockLicenseVerificationWebsite.post.invalid.html'
      )
    );
}
