//========================================================
//? importing
//========================================================
import 'package:flutter/material.dart';

import '../../../service/localization/localization_service.dart';

//========================================================
// this widget shows :
// -

class LoginHeader extends StatelessWidget {
  final Color background;
  final Color textColor;

  const LoginHeader({
    super.key,
    required this.background,
    required this.textColor,
  });

  // ==============================================================
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.only(),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Bus logo ===================================================
          const Image(
            image: AssetImage('assets/BusLogoWhite.png'),
            width: 70,
            height: 70,
          ),

          const SizedBox(height: 20),

          // App title ===================================================
          Text(
            'driver_app_title'.translate,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: textColor,
              fontSize: 30,
              fontWeight: FontWeight.w400,
            ),
          ),

          // Login title ===================================================
          Text(
            'driver_login_title'.translate,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: textColor,
              fontSize: 25,
              fontWeight: FontWeight.w200,
            ),
          ),
        ],
        //======================================================================
      ),
    );
  }
}
